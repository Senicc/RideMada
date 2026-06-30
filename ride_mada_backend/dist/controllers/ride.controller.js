"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRides = exports.estimateFare = exports.cancelRide = exports.updateRide = exports.getRideById = exports.findNearbyDrivers = exports.getNearbyRides = exports.createRide = void 0;
const db_1 = __importDefault(require("../config/db"));
const serialize_1 = require("../utils/serialize");
const distance_1 = require("../utils/distance");
const pricing_1 = require("../utils/pricing");
const NEARBY_RADIUS_KM = 50;
async function getDriverRecordForUser(userId) {
    return db_1.default.driver.findUnique({ where: { userId } });
}
const createRide = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }
        const driver = await getDriverRecordForUser(userId);
        if (!driver) {
            return res.status(400).json({ success: false, message: 'Profil conducteur introuvable' });
        }
        if (!driver.isApproved) {
            return res.status(403).json({ success: false, message: 'Compte conducteur en attente de validation' });
        }
        const { departureLat, departureLng, arrivalLat, arrivalLng, departureAddress, arrivalAddress, departureTime, price, availableSeats, vehicleId, } = req.body;
        const vehicle = await db_1.default.vehicle.findFirst({
            where: { id: vehicleId, driverId: driver.id, isActive: true },
        });
        if (!vehicle) {
            return res.status(400).json({ success: false, message: 'Véhicule invalide ou non autorisé' });
        }
        const ride = await db_1.default.ride.create({
            data: {
                driverId: driver.id,
                vehicleId,
                departureLat,
                departureLng,
                arrivalLat,
                arrivalLng,
                departureAddress,
                arrivalAddress,
                departureTime: new Date(departureTime),
                price,
                availableSeats,
            },
            include: { vehicle: true, driver: { include: { user: true } } },
        });
        res.status(201).json({ success: true, ride: (0, serialize_1.serializeRide)(ride) });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createRide = createRide;
const getNearbyRides = async (req, res) => {
    const lat = parseFloat(String(req.query.lat));
    const lng = parseFloat(String(req.query.lng));
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return res.status(400).json({ success: false, message: 'lat et lng requis' });
    }
    const rides = await db_1.default.ride.findMany({
        where: {
            status: 'PENDING',
            availableSeats: { gt: 0 },
            departureTime: { gt: new Date() },
        },
        take: 50,
        orderBy: { departureTime: 'asc' },
        include: { driver: { include: { user: { select: { id: true, name: true, photo: true, rating: true } } } }, vehicle: true },
    });
    const nearby = rides
        .map((ride) => ({
        ride,
        distanceKm: (0, distance_1.calculateHaversineDistance)(lat, lng, ride.departureLat, ride.departureLng),
    }))
        .filter((item) => item.distanceKm <= NEARBY_RADIUS_KM)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 20)
        .map((item) => item.ride);
    res.json({ success: true, rides: (0, serialize_1.serializeRides)(nearby) });
};
exports.getNearbyRides = getNearbyRides;
const findNearbyDrivers = async (req, res) => {
    const lat = parseFloat(String(req.query.lat));
    const lng = parseFloat(String(req.query.lng));
    const radiusKm = parseFloat(String(req.query.radius ?? NEARBY_RADIUS_KM));
    const drivers = await db_1.default.driver.findMany({
        where: {
            status: 'ONLINE',
            isApproved: true,
            currentLat: { not: null },
            currentLng: { not: null },
        },
        include: {
            user: { select: { id: true, name: true, photo: true, rating: true } },
            vehicles: { select: { id: true, brand: true, model: true, type: true, seats: true } },
        },
    });
    const filtered = drivers.filter((d) => {
        if (d.currentLat == null || d.currentLng == null)
            return false;
        if (Number.isNaN(lat) || Number.isNaN(lng))
            return true;
        return (0, distance_1.calculateHaversineDistance)(lat, lng, d.currentLat, d.currentLng) <= radiusKm;
    });
    res.json({ success: true, drivers: filtered });
};
exports.findNearbyDrivers = findNearbyDrivers;
const getRideById = async (req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant trajet manquant' });
    }
    const ride = await db_1.default.ride.findUnique({
        where: { id },
        include: { driver: { include: { user: true } }, vehicle: true, bookings: true },
    });
    if (!ride) {
        return res.status(404).json({ success: false, message: 'Trajet introuvable' });
    }
    res.json({ success: true, ride: (0, serialize_1.serializeRide)(ride) });
};
exports.getRideById = getRideById;
const updateRide = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant trajet manquant' });
    }
    const driver = await getDriverRecordForUser(userId);
    if (!driver) {
        return res.status(400).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    const existing = await db_1.default.ride.findUnique({ where: { id } });
    if (!existing || existing.driverId !== driver.id) {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    const { departureTime, price, availableSeats, status } = req.body;
    const ride = await db_1.default.ride.update({
        where: { id },
        data: {
            ...(departureTime !== undefined && { departureTime: new Date(departureTime) }),
            ...(price !== undefined && { price }),
            ...(availableSeats !== undefined && { availableSeats }),
            ...(status !== undefined && { status }),
        },
        include: { vehicle: true, driver: { include: { user: true } } },
    });
    res.json({ success: true, ride: (0, serialize_1.serializeRide)(ride) });
};
exports.updateRide = updateRide;
const cancelRide = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
        return res.status(400).json({ success: false, message: 'Identifiant trajet manquant' });
    }
    const driver = await getDriverRecordForUser(userId);
    if (!driver) {
        return res.status(400).json({ success: false, message: 'Profil conducteur introuvable' });
    }
    const existing = await db_1.default.ride.findUnique({ where: { id } });
    if (!existing || existing.driverId !== driver.id) {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    const ride = await db_1.default.$transaction(async (tx) => {
        await tx.booking.updateMany({
            where: { rideId: id, status: 'CONFIRMED' },
            data: { status: 'CANCELLED' },
        });
        return tx.ride.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
    });
    res.json({ success: true, ride: (0, serialize_1.serializeRide)(ride) });
};
exports.cancelRide = cancelRide;
const estimateFare = async (req, res) => {
    const departureLat = parseFloat(String(req.query.departureLat));
    const departureLng = parseFloat(String(req.query.departureLng));
    const arrivalLat = parseFloat(String(req.query.arrivalLat));
    const arrivalLng = parseFloat(String(req.query.arrivalLng));
    const vehicleType = String(req.query.vehicleType ?? 'SEDAN').toUpperCase();
    if ([departureLat, departureLng, arrivalLat, arrivalLng].some(Number.isNaN)) {
        return res.status(400).json({ success: false, message: 'Coordonnées de départ et arrivée requises' });
    }
    const estimate = (0, pricing_1.estimateTripFare)(departureLat, departureLng, arrivalLat, arrivalLng, vehicleType);
    res.json({ success: true, estimate });
};
exports.estimateFare = estimateFare;
const getAllRides = async (req, res) => {
    const rides = await db_1.default.ride.findMany({
        where: { status: 'PENDING' },
        orderBy: { departureTime: 'asc' },
        take: 50,
        include: { driver: { include: { user: true } }, vehicle: true },
    });
    res.json({ success: true, rides: (0, serialize_1.serializeRides)(rides) });
};
exports.getAllRides = getAllRides;
//# sourceMappingURL=ride.controller.js.map