import type { Request, Response } from 'express';
import prisma from '../config/db';

async function getDriverRecordForUser(userId: string) {
  return prisma.driver.findUnique({ where: { userId } });
}

export const createRide = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const driver = await getDriverRecordForUser(userId);
    if (!driver) {
      return res.status(400).json({ success: false, message: 'Profil conducteur introuvable' });
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

    res.status(201).json({ success: true, ride });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyRides = async (req: Request, res: Response) => {
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
    take: 20,
    orderBy: { departureTime: 'asc' },
    include: { driver: { include: { user: true } }, vehicle: true },
  });

  res.json({ success: true, rides });
};

export const findNearbyDrivers = async (req: Request, res: Response) => {
  const drivers = await prisma.driver.findMany({
    where: {
      status: 'ONLINE',
      isApproved: true,
      currentLat: { not: null },
      currentLng: { not: null },
    },
    include: { user: true, vehicles: true },
  });

  res.json({ success: true, drivers });
};

export const getRideById = async (req: Request, res: Response) => {
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

  res.json({ success: true, ride });
};

export const updateRide = async (req: Request, res: Response) => {
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

  res.json({ success: true, ride });
};

export const cancelRide = async (req: Request, res: Response) => {
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

  res.json({ success: true, ride });
};

export const getAllRides = async (req: Request, res: Response) => {
  const rides = await prisma.ride.findMany({
    where: { status: 'PENDING' },
    orderBy: { departureTime: 'asc' },
    take: 50,
    include: { driver: { include: { user: true } }, vehicle: true },
  });

  res.json({ success: true, rides });
};
