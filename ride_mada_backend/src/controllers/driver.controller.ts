import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
import prisma from '../config/db';

export const becomeDriver = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const { documents, brand, model, color, plate, seats, type } = req.body;

    const driver = await prisma.driver.upsert({
      where: { userId },
      update: { documents: documents ?? {}, isApproved: false },
      create: {
        userId,
        documents: documents ?? {},
        isApproved: false,
      },
    });

    if (brand && model && plate) {
      const existing = await prisma.vehicle.findUnique({ where: { plate } });
      if (!existing) {
        await prisma.vehicle.create({
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDriverLocation = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { lat, lng } = req.body;

  await prisma.driver.update({
    where: { userId },
    data: { currentLat: lat, currentLng: lng, status: 'ONLINE' },
  });

  res.json({ success: true });
};

export const getDriverStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const driver = await prisma.driver.findUnique({
    where: { userId },
    select: { status: true, currentLat: true, currentLng: true, isApproved: true },
  });

  if (!driver) {
    return res.status(404).json({ success: false, message: 'Profil conducteur introuvable' });
  }

  res.json({ success: true, driver });
};

export const updateDriverStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { status } = req.body as { status?: string };
  if (!status || !['ONLINE', 'OFFLINE'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Statut ONLINE ou OFFLINE requis' });
  }

  const driver = await prisma.driver.update({
    where: { userId },
    data: {
      status: status as 'ONLINE' | 'OFFLINE',
      ...(status === 'OFFLINE' ? { currentLat: null, currentLng: null } : {}),
    },
    select: { id: true, status: true, isApproved: true },
  });

  res.json({ success: true, driver });
};

export const getDriverEarnings = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Profil conducteur introuvable' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [completedRides, todayBookings, revenueAgg] = await Promise.all([
    prisma.ride.count({
      where: { driverId: driver.id, status: 'COMPLETED' },
    }),
    prisma.booking.count({
      where: {
        ride: { driverId: driver.id },
        status: 'COMPLETED',
        createdAt: { gte: today },
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        booking: { ride: { driverId: driver.id } },
      },
      _sum: { amount: true },
    }),
  ]);

  const pendingRides = await prisma.ride.findMany({
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
      totalRevenue: Number(revenueAgg._sum.amount ?? 0),
      completedRides,
      todayTrips: todayBookings,
    },
    pendingRides,
  });
};

export const getDriverProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: { user: true, vehicles: true },
  });

  if (!driver) {
    return res.status(404).json({ success: false, message: 'Profil conducteur introuvable' });
  }

  res.json({ success: true, driver });
};
