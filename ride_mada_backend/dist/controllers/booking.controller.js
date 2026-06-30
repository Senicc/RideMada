"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingsByRide = exports.getMyBookings = exports.cancelBooking = exports.createBooking = void 0;
const db_1 = __importDefault(require("../config/db"));
const notification_service_1 = require("../services/notification.service");
const createBooking = async (req, res) => {
    const passengerId = req.user?.id;
    if (!passengerId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const { rideId, seats } = req.body;
    if (!rideId || typeof seats !== 'number' || seats < 1) {
        return res.status(400).json({ success: false, message: 'rideId et seats valides requis' });
    }
    const ride = await db_1.default.ride.findUnique({
        where: { id: rideId },
        include: { driver: true },
    });
    if (!ride || ride.status !== 'PENDING') {
        return res.status(404).json({ success: false, message: 'Trajet indisponible' });
    }
    if (ride.driver.userId === passengerId) {
        return res.status(400).json({ success: false, message: 'Vous ne pouvez pas réserver votre propre trajet' });
    }
    if (ride.availableSeats < seats) {
        return res.status(400).json({ success: false, message: 'Places insuffisantes' });
    }
    const existing = await db_1.default.booking.findFirst({
        where: { rideId, passengerId, status: 'CONFIRMED' },
    });
    if (existing) {
        return res.status(409).json({ success: false, message: 'Réservation déjà existante pour ce trajet' });
    }
    const booking = await db_1.default.$transaction(async (tx) => {
        const created = await tx.booking.create({
            data: { rideId, passengerId, seats },
            include: {
                ride: {
                    include: {
                        driver: {
                            include: { user: { select: { id: true, name: true, photo: true, phone: true } } },
                        },
                    },
                },
                passenger: { select: { id: true, name: true, phone: true } },
            },
        });
        await tx.ride.update({
            where: { id: rideId },
            data: { availableSeats: { decrement: seats } },
        });
        return created;
    });
    const passenger = await db_1.default.user.findUnique({
        where: { id: passengerId },
        select: { name: true },
    });
    await notification_service_1.NotificationService.notifyNewBooking(rideId, passenger?.name ?? 'Passager', seats);
    res.status(201).json({ success: true, booking });
};
exports.createBooking = createBooking;
const cancelBooking = async (req, res) => {
    const passengerId = req.user?.id;
    if (!passengerId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant réservation manquant' });
    }
    const existing = await db_1.default.booking.findFirst({
        where: { id, passengerId, status: 'CONFIRMED' },
    });
    if (!existing) {
        return res.status(404).json({ success: false, message: 'Réservation introuvable ou déjà annulée' });
    }
    await db_1.default.$transaction(async (tx) => {
        await tx.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
        await tx.ride.update({
            where: { id: existing.rideId },
            data: { availableSeats: { increment: existing.seats } },
        });
    });
    res.json({ success: true, message: 'Réservation annulée' });
};
exports.cancelBooking = cancelBooking;
const getMyBookings = async (req, res) => {
    const passengerId = req.user?.id;
    if (!passengerId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const bookings = await db_1.default.booking.findMany({
        where: { passengerId },
        include: {
            ride: {
                include: {
                    driver: { include: { user: { select: { id: true, name: true, photo: true, rating: true } } } },
                    vehicle: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, bookings });
};
exports.getMyBookings = getMyBookings;
const getBookingsByRide = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const rideId = typeof req.params.rideId === 'string' ? req.params.rideId : req.params.rideId?.[0];
    if (!rideId) {
        return res.status(400).json({ success: false, message: 'rideId requis' });
    }
    const ride = await db_1.default.ride.findUnique({
        where: { id: rideId },
        include: { driver: true },
    });
    if (!ride) {
        return res.status(404).json({ success: false, message: 'Trajet introuvable' });
    }
    if (ride.driver.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    const bookings = await db_1.default.booking.findMany({
        where: { rideId },
        include: { passenger: { select: { id: true, name: true, phone: true, photo: true } } },
        orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, bookings });
};
exports.getBookingsByRide = getBookingsByRide;
//# sourceMappingURL=booking.controller.js.map