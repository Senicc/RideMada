"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriverProfile = exports.getDriverEarnings = exports.updateDriverStatus = exports.getDriverStatus = exports.updateDriverLocation = exports.becomeDriver = void 0;
const db_1 = __importDefault(require("../config/db"));
const becomeDriver = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }
        const { documents, brand, model, color, plate, seats, type } = req.body;
        const driver = await db_1.default.driver.upsert({
            where: { userId },
            update: { documents: documents ?? {}, isApproved: false },
            create: {
                userId,
                documents: documents ?? {},
                isApproved: false,
            },
        });
        if (brand && model && plate) {
            const existing = await db_1.default.vehicle.findUnique({ where: { plate } });
            if (!existing) {
                await db_1.default.vehicle.create({
                    data: {
                        driverId: driver.id,
                        brand,
                        model,
                        color: color ?? 'N/A',
                        plate,
                        seats: Number(seats) || 4,
                        type: type ?? 'SEDAN',
                    },
                });
            }
        }
        res.json({ success: true, driver, message: 'Demande conducteur enregistrée' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.becomeDriver = becomeDriver;
const updateDriverLocation = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const { lat, lng } = req.body;
    await db_1.default.driver.update({
        where: { userId },
        data: { currentLat: lat, currentLng: lng, status: 'ONLINE' },
    });
    res.json({ success: true });
};
exports.updateDriverLocation = updateDriverLocation;
const getDriverStatus = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const driver = await db_1.default.driver.findUnique({
        where: { userId },
        select: { status: true, currentLat: true, currentLng: true, isApproved: true },
    });
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    res.json({ success: true, driver });
};
exports.getDriverStatus = getDriverStatus;
const updateDriverStatus = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const { status } = req.body;
    if (!status || !['ONLINE', 'OFFLINE'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Statut ONLINE ou OFFLINE requis' });
    }
    const driver = await db_1.default.driver.update({
        where: { userId },
        data: {
            status: status,
            ...(status === 'OFFLINE' ? { currentLat: null, currentLng: null } : {}),
        },
        select: { id: true, status: true, isApproved: true },
    });
    res.json({ success: true, driver });
};
exports.updateDriverStatus = updateDriverStatus;
const getDriverEarnings = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const driver = await db_1.default.driver.findUnique({ where: { userId } });
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [completedRides, todayBookings, revenueBooking, revenueOnDemand, completedOnDemand] = await Promise.all([
        db_1.default.ride.count({
            where: { driverId: driver.id, status: 'COMPLETED' },
        }),
        db_1.default.booking.count({
            where: {
                ride: { driverId: driver.id },
                status: 'COMPLETED',
                createdAt: { gte: today },
            },
        }),
        db_1.default.payment.aggregate({
            where: {
                status: 'COMPLETED',
                booking: { ride: { driverId: driver.id } },
            },
            _sum: { amount: true },
        }),
        db_1.default.payment.aggregate({
            where: {
                status: 'COMPLETED',
                rideRequest: { driverId: driver.id },
            },
            _sum: { amount: true },
        }),
        db_1.default.rideRequest.count({
            where: { driverId: driver.id, status: 'COMPLETED', updatedAt: { gte: today } },
        }),
    ]);
    const totalRevenue = Number(revenueBooking._sum.amount ?? 0) + Number(revenueOnDemand._sum.amount ?? 0);
    const pendingRides = await db_1.default.ride.findMany({
        where: { driverId: driver.id, status: 'PENDING', availableSeats: { gt: 0 } },
        take: 20,
        orderBy: { departureTime: 'asc' },
        include: {
            bookings: { include: { passenger: { select: { id: true, name: true, phone: true, rating: true } } } },
            vehicle: true,
        },
    });
    res.json({
        success: true,
        earnings: {
            totalRevenue,
            completedRides: completedRides + completedOnDemand,
            todayTrips: todayBookings + completedOnDemand,
        },
        pendingRides,
    });
};
exports.getDriverEarnings = getDriverEarnings;
const getDriverProfile = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const driver = await db_1.default.driver.findUnique({
        where: { userId },
        include: { user: true, vehicles: true },
    });
    if (!driver) {
        return res.status(404).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    res.json({ success: true, driver });
};
exports.getDriverProfile = getDriverProfile;
//# sourceMappingURL=driver.controller.js.map