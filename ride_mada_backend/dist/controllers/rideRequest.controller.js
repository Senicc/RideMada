"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriverRideHistory = exports.getDriverActiveRide = exports.cancelRideRequest = exports.completeRideRequest = exports.startRideRequest = exports.driverArriving = exports.rejectRideRequest = exports.acceptRideRequest = exports.getRideRequestById = exports.getPendingForDriver = exports.getMyRideRequests = exports.createRideRequest = void 0;
const db_1 = __importDefault(require("../config/db"));
const distance_1 = require("../utils/distance");
const pricing_1 = require("../utils/pricing");
const notification_service_1 = require("../services/notification.service");
const io_1 = require("../sockets/io");
const NEARBY_KM = 15;
function serializeRideRequest(r) {
    return {
        ...r,
        estimatedPrice: r.estimatedPrice != null ? Number(r.estimatedPrice) : null,
        finalPrice: r.finalPrice != null ? Number(r.finalPrice) : null,
    };
}
async function notifyNearbyDrivers(requestId, lat, lng) {
    const io = (0, io_1.getIO)();
    if (!io)
        return;
    const drivers = await db_1.default.driver.findMany({
        where: { status: 'ONLINE', isApproved: true, currentLat: { not: null }, currentLng: { not: null } },
        include: { user: { select: { id: true, name: true } } },
    });
    const request = await db_1.default.rideRequest.findUnique({ where: { id: requestId } });
    if (!request)
        return;
    for (const driver of drivers) {
        const dist = (0, distance_1.calculateHaversineDistance)(lat, lng, driver.currentLat, driver.currentLng);
        if (dist <= NEARBY_KM) {
            io.to(`user_${driver.userId}`).emit('newRideRequest', serializeRideRequest(request));
            await notification_service_1.NotificationService.createInAppNotification(driver.userId, 'Nouvelle course', `Demande à ${request.pickupAddress}`, 'RIDE_UPDATE');
            await notification_service_1.NotificationService.sendPushNotification(driver.userId, 'Nouvelle course', `Demande à ${request.pickupAddress}`, { type: 'RIDE_UPDATE', rideRequestId: requestId });
        }
    }
}
const createRideRequest = async (req, res) => {
    try {
        const passengerId = req.user?.id;
        if (!passengerId) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }
        const { pickupLat, pickupLng, pickupAddress, dropoffLat, dropoffLng, dropoffAddress, vehicleType, scheduledAt, couponCode, } = req.body;
        if ([pickupLat, pickupLng, dropoffLat, dropoffLng].some((v) => typeof v !== 'number') ||
            !pickupAddress ||
            !dropoffAddress) {
            return res.status(400).json({ success: false, message: 'Coordonnées et adresses requises' });
        }
        const type = (vehicleType ?? 'SEDAN').toUpperCase();
        const estimate = (0, pricing_1.estimateTripFare)(pickupLat, pickupLng, dropoffLat, dropoffLng, type);
        let finalEstimate = estimate.price;
        if (couponCode) {
            const coupon = await db_1.default.coupon.findFirst({
                where: { code: couponCode, isActive: true, validUntil: { gt: new Date() } },
            });
            if (coupon && coupon.timesUsed < coupon.usageLimit) {
                const discount = Number(coupon.discount);
                finalEstimate =
                    coupon.type === 'PERCENTAGE'
                        ? Math.round(finalEstimate * (1 - discount / 100))
                        : Math.max(0, finalEstimate - discount);
            }
        }
        const active = await db_1.default.rideRequest.findFirst({
            where: {
                passengerId,
                status: { in: ['REQUESTED', 'ACCEPTED', 'DRIVER_ARRIVING', 'IN_PROGRESS'] },
            },
        });
        if (active) {
            return res.status(409).json({ success: false, message: 'Vous avez déjà une course en cours' });
        }
        const rideRequest = await db_1.default.rideRequest.create({
            data: {
                passengerId,
                pickupLat,
                pickupLng,
                pickupAddress,
                dropoffLat,
                dropoffLng,
                dropoffAddress,
                vehicleType: type,
                estimatedPrice: finalEstimate,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                couponCode: couponCode ?? null,
            },
            include: {
                passenger: { select: { id: true, name: true, phone: true, photo: true } },
            },
        });
        await notifyNearbyDrivers(rideRequest.id, pickupLat, pickupLng);
        res.status(201).json({ success: true, rideRequest: serializeRideRequest(rideRequest) });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        res.status(500).json({ success: false, message });
    }
};
exports.createRideRequest = createRideRequest;
const getMyRideRequests = async (req, res) => {
    const passengerId = req.user?.id;
    if (!passengerId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const rideRequests = await db_1.default.rideRequest.findMany({
        where: { passengerId },
        include: {
            driver: { include: { user: { select: { id: true, name: true, photo: true, phone: true, rating: true } }, vehicles: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    res.json({
        success: true,
        rideRequests: rideRequests.map((r) => serializeRideRequest(r)),
    });
};
exports.getMyRideRequests = getMyRideRequests;
const getPendingForDriver = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const driver = await db_1.default.driver.findUnique({ where: { userId } });
    if (!driver?.isApproved) {
        return res.status(403).json({ success: false, message: 'Compte conducteur non validé' });
    }
    const lat = parseFloat(String(req.query.lat ?? driver.currentLat ?? ''));
    const lng = parseFloat(String(req.query.lng ?? driver.currentLng ?? ''));
    const requests = await db_1.default.rideRequest.findMany({
        where: { status: 'REQUESTED' },
        include: { passenger: { select: { id: true, name: true, photo: true, rating: true } } },
        orderBy: { createdAt: 'desc' },
        take: 30,
    });
    const filtered = Number.isNaN(lat) || Number.isNaN(lng)
        ? requests
        : requests.filter((r) => (0, distance_1.calculateHaversineDistance)(lat, lng, r.pickupLat, r.pickupLng) <= NEARBY_KM);
    res.json({
        success: true,
        rideRequests: filtered.map((r) => serializeRideRequest(r)),
    });
};
exports.getPendingForDriver = getPendingForDriver;
const getRideRequestById = async (req, res) => {
    const userId = req.user?.id;
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!userId || !id) {
        return res.status(400).json({ success: false, message: 'Requête invalide' });
    }
    const rideRequest = await db_1.default.rideRequest.findUnique({
        where: { id },
        include: {
            passenger: { select: { id: true, name: true, phone: true, photo: true, rating: true } },
            driver: { include: { user: { select: { id: true, name: true, phone: true, photo: true, rating: true } }, vehicles: true } },
        },
    });
    if (!rideRequest) {
        return res.status(404).json({ success: false, message: 'Course introuvable' });
    }
    const isPassenger = rideRequest.passengerId === userId;
    const isDriver = rideRequest.driver?.userId === userId;
    if (!isPassenger && !isDriver && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    res.json({ success: true, rideRequest: serializeRideRequest(rideRequest) });
};
exports.getRideRequestById = getRideRequestById;
async function updateStatus(req, res, allowedStatuses, nextStatus, extra) {
    const userId = req.user?.id;
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!userId || !id) {
        return res.status(400).json({ success: false, message: 'Requête invalide' });
    }
    const existing = await db_1.default.rideRequest.findUnique({
        where: { id },
        include: { driver: true, passenger: true },
    });
    if (!existing || !allowedStatuses.includes(existing.status)) {
        return res.status(400).json({ success: false, message: 'Transition de statut invalide' });
    }
    const rideRequest = await db_1.default.rideRequest.update({
        where: { id },
        data: { status: nextStatus, ...extra },
        include: {
            passenger: { select: { id: true, name: true, phone: true, photo: true } },
            driver: { include: { user: { select: { id: true, name: true, phone: true, photo: true } }, vehicles: true } },
        },
    });
    const io = (0, io_1.getIO)();
    io?.to(`user_${existing.passengerId}`).emit('rideRequestStatusUpdate', { id, status: nextStatus });
    if (existing.driverId && rideRequest.driver) {
        io?.to(`user_${rideRequest.driver.userId}`).emit('rideRequestStatusUpdate', { id, status: nextStatus });
    }
    io?.to(`ride_request_${id}`).emit('rideRequestStatusUpdate', { id, status: nextStatus });
    res.json({ success: true, rideRequest: serializeRideRequest(rideRequest) });
}
const acceptRideRequest = async (req, res) => {
    const userId = req.user?.id;
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!userId || !id) {
        return res.status(400).json({ success: false, message: 'Requête invalide' });
    }
    const driver = await db_1.default.driver.findUnique({ where: { userId } });
    if (!driver?.isApproved) {
        return res.status(403).json({ success: false, message: 'Compte conducteur non validé' });
    }
    const onRide = await db_1.default.rideRequest.findFirst({
        where: { driverId: driver.id, status: { in: ['ACCEPTED', 'DRIVER_ARRIVING', 'IN_PROGRESS'] } },
    });
    if (onRide) {
        return res.status(409).json({ success: false, message: 'Vous avez déjà une course active' });
    }
    const existing = await db_1.default.rideRequest.findUnique({ where: { id } });
    if (!existing || existing.status !== 'REQUESTED') {
        return res.status(400).json({ success: false, message: 'Course indisponible' });
    }
    const rideRequest = await db_1.default.$transaction(async (tx) => {
        const updated = await tx.rideRequest.update({
            where: { id, status: 'REQUESTED' },
            data: { driverId: driver.id, status: 'ACCEPTED' },
            include: {
                passenger: { select: { id: true, name: true, phone: true, photo: true } },
                driver: { include: { user: { select: { id: true, name: true, phone: true, photo: true } }, vehicles: true } },
            },
        });
        await tx.driver.update({ where: { id: driver.id }, data: { status: 'ON_RIDE' } });
        return updated;
    });
    const io = (0, io_1.getIO)();
    io?.to(`user_${existing.passengerId}`).emit('rideRequestAccepted', serializeRideRequest(rideRequest));
    await notification_service_1.NotificationService.createInAppNotification(existing.passengerId, 'Chauffeur trouvé', 'Un chauffeur a accepté votre course', 'RIDE_UPDATE');
    res.json({ success: true, rideRequest: serializeRideRequest(rideRequest) });
};
exports.acceptRideRequest = acceptRideRequest;
const rejectRideRequest = async (req, res) => {
    res.json({ success: true, message: 'Course refusée' });
};
exports.rejectRideRequest = rejectRideRequest;
const driverArriving = async (req, res) => {
    return updateStatus(req, res, ['ACCEPTED'], 'DRIVER_ARRIVING');
};
exports.driverArriving = driverArriving;
const startRideRequest = async (req, res) => {
    return updateStatus(req, res, ['ACCEPTED', 'DRIVER_ARRIVING'], 'IN_PROGRESS');
};
exports.startRideRequest = startRideRequest;
const completeRideRequest = async (req, res) => {
    const userId = req.user?.id;
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!userId || !id) {
        return res.status(400).json({ success: false, message: 'Requête invalide' });
    }
    const existing = await db_1.default.rideRequest.findUnique({
        where: { id },
        include: { driver: true },
    });
    if (!existing || existing.status !== 'IN_PROGRESS') {
        return res.status(400).json({ success: false, message: 'Course non démarrée' });
    }
    if (existing.driver?.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    const rideRequest = await db_1.default.$transaction(async (tx) => {
        const updated = await tx.rideRequest.update({
            where: { id },
            data: { status: 'COMPLETED', finalPrice: existing.estimatedPrice },
            include: {
                passenger: { select: { id: true, name: true, phone: true, photo: true } },
                driver: { include: { user: { select: { id: true, name: true, phone: true, photo: true } }, vehicles: true } },
            },
        });
        if (existing.driverId) {
            await tx.driver.update({ where: { id: existing.driverId }, data: { status: 'ONLINE' } });
        }
        return updated;
    });
    const io = (0, io_1.getIO)();
    io?.to(`ride_request_${id}`).emit('rideRequestCompleted', { id });
    await notification_service_1.NotificationService.createInAppNotification(existing.passengerId, 'Course terminée', 'Merci d\'avoir voyagé avec RideMada', 'RIDE_UPDATE');
    res.json({ success: true, rideRequest: serializeRideRequest(rideRequest) });
};
exports.completeRideRequest = completeRideRequest;
const cancelRideRequest = async (req, res) => {
    const userId = req.user?.id;
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!userId || !id) {
        return res.status(400).json({ success: false, message: 'Requête invalide' });
    }
    const existing = await db_1.default.rideRequest.findUnique({
        where: { id },
        include: { driver: true },
    });
    if (!existing || ['COMPLETED', 'CANCELLED'].includes(existing.status)) {
        return res.status(400).json({ success: false, message: 'Course déjà terminée ou annulée' });
    }
    const isPassenger = existing.passengerId === userId;
    const isDriver = existing.driver?.userId === userId;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isPassenger && !isDriver && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    const rideRequest = await db_1.default.$transaction(async (tx) => {
        const updated = await tx.rideRequest.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
        if (existing.driverId) {
            await tx.driver.update({ where: { id: existing.driverId }, data: { status: 'ONLINE' } });
        }
        return updated;
    });
    (0, io_1.getIO)()?.to(`ride_request_${id}`).emit('rideRequestCancelled', { id });
    res.json({ success: true, rideRequest: serializeRideRequest(rideRequest) });
};
exports.cancelRideRequest = cancelRideRequest;
const getDriverActiveRide = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const driver = await db_1.default.driver.findUnique({ where: { userId } });
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    const rideRequest = await db_1.default.rideRequest.findFirst({
        where: {
            driverId: driver.id,
            status: { in: ['ACCEPTED', 'DRIVER_ARRIVING', 'IN_PROGRESS'] },
        },
        include: {
            passenger: { select: { id: true, name: true, phone: true, photo: true, rating: true } },
        },
        orderBy: { updatedAt: 'desc' },
    });
    res.json({
        success: true,
        rideRequest: rideRequest
            ? serializeRideRequest(rideRequest)
            : null,
    });
};
exports.getDriverActiveRide = getDriverActiveRide;
const getDriverRideHistory = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const driver = await db_1.default.driver.findUnique({ where: { userId } });
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    const [rideRequests, sharedRides] = await Promise.all([
        db_1.default.rideRequest.findMany({
            where: { driverId: driver.id },
            include: { passenger: { select: { id: true, name: true, photo: true, rating: true } } },
            orderBy: { createdAt: 'desc' },
            take: 30,
        }),
        db_1.default.ride.findMany({
            where: { driverId: driver.id },
            orderBy: { createdAt: 'desc' },
            take: 30,
            include: { vehicle: true, bookings: true },
        }),
    ]);
    res.json({
        success: true,
        rideRequests: rideRequests.map((r) => serializeRideRequest(r)),
        sharedRides,
    });
};
exports.getDriverRideHistory = getDriverRideHistory;
//# sourceMappingURL=rideRequest.controller.js.map