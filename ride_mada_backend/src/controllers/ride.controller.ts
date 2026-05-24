import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
import prisma from '../config/db';
import { serializeRide, serializeRides } from '../utils/serialize';
import { calculateHaversineDistance } from '../utils/distance';
import { estimateTripFare, type FareVehicleType } from '../utils/pricing';

const NEARBY_RADIUS_KM = 50;

async function getDriverRecordForUser(userId: string) {
  return prisma.driver.findUnique({ where: { userId } });
}

export const createRide = async (req: AuthRequest, res: Response) => {
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

    const {
      departureLat,
      departureLng,
      arrivalLat,
      arrivalLng,
      departureAddress,
      arrivalAddress,
      departureTime,
      price,
      availableSeats,
      vehicleId,
    } = req.body;

    const ride = await prisma.ride.create({
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

    res.status(201).json({ success: true, ride: serializeRide(ride) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyRides = async (req: AuthRequest, res: Response) => {
  const lat = parseFloat(String(req.query.lat));
  const lng = parseFloat(String(req.query.lng));
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ success: false, message: 'lat et lng requis' });
  }

  const rides = await prisma.ride.findMany({
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
      distanceKm: calculateHaversineDistance(lat, lng, ride.departureLat, ride.departureLng),
    }))
    .filter((item) => item.distanceKm <= NEARBY_RADIUS_KM)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 20)
    .map((item) => item.ride);

  res.json({ success: true, rides: serializeRides(nearby) });
};

export const findNearbyDrivers = async (req: AuthRequest, res: Response) => {
  const lat = parseFloat(String(req.query.lat));
  const lng = parseFloat(String(req.query.lng));
  const radiusKm = parseFloat(String(req.query.radius ?? NEARBY_RADIUS_KM));

  const drivers = await prisma.driver.findMany({
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
    if (d.currentLat == null || d.currentLng == null) return false;
    if (Number.isNaN(lat) || Number.isNaN(lng)) return true;
    return calculateHaversineDistance(lat, lng, d.currentLat, d.currentLng) <= radiusKm;
  });

  res.json({ success: true, drivers: filtered });
};

export const getRideById = async (req: AuthRequest, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!id) {
    return res.status(400).json({ success: false, message: 'Identifiant trajet manquant' });
  }

  const ride = await prisma.ride.findUnique({
    where: { id },
    include: { driver: { include: { user: true } }, vehicle: true, bookings: true },
  });

  if (!ride) {
    return res.status(404).json({ success: false, message: 'Trajet introuvable' });
  }

  res.json({ success: true, ride: serializeRide(ride) });
};

export const updateRide = async (req: AuthRequest, res: Response) => {
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

  const existing = await prisma.ride.findUnique({ where: { id } });
  if (!existing || existing.driverId !== driver.id) {
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  }

  const { departureTime, price, availableSeats, status } = req.body;
  const ride = await prisma.ride.update({
    where: { id },
    data: {
      ...(departureTime !== undefined && { departureTime: new Date(departureTime) }),
      ...(price !== undefined && { price }),
      ...(availableSeats !== undefined && { availableSeats }),
      ...(status !== undefined && { status }),
    },
    include: { vehicle: true, driver: { include: { user: true } } },
  });

  res.json({ success: true, ride: serializeRide(ride) });
};

export const cancelRide = async (req: AuthRequest, res: Response) => {
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

  const existing = await prisma.ride.findUnique({ where: { id } });
  if (!existing || existing.driverId !== driver.id) {
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  }

  const ride = await prisma.ride.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  res.json({ success: true, ride: serializeRide(ride) });
};

export const estimateFare = async (req: AuthRequest, res: Response) => {
  const departureLat = parseFloat(String(req.query.departureLat));
  const departureLng = parseFloat(String(req.query.departureLng));
  const arrivalLat = parseFloat(String(req.query.arrivalLat));
  const arrivalLng = parseFloat(String(req.query.arrivalLng));
  const vehicleType = (String(req.query.vehicleType ?? 'SEDAN').toUpperCase() as FareVehicleType);

  if ([departureLat, departureLng, arrivalLat, arrivalLng].some(Number.isNaN)) {
    return res.status(400).json({ success: false, message: 'Coordonnées de départ et arrivée requises' });
  }

  const estimate = estimateTripFare(departureLat, departureLng, arrivalLat, arrivalLng, vehicleType);
  res.json({ success: true, estimate });
};

export const getAllRides = async (req: AuthRequest, res: Response) => {
  const rides = await prisma.ride.findMany({
    where: { status: 'PENDING' },
    orderBy: { departureTime: 'asc' },
    take: 50,
    include: { driver: { include: { user: true } }, vehicle: true },
  });

  res.json({ success: true, rides: serializeRides(rides) });
};
