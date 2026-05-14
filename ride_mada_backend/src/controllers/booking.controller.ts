import type { Request, Response } from 'express';
import prisma from '../config/db';

interface CreateBookingBody {
  rideId: string;
  seats: number;
}

export const createBooking = async (req: Request, res: Response) => {
  const passengerId = req.user?.id;
  if (!passengerId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { rideId, seats } = req.body as CreateBookingBody;
  if (!rideId || typeof seats !== 'number' || seats < 1) {
    return res.status(400).json({ success: false, message: 'rideId et seats valides requis' });
  }

  const booking = await prisma.booking.create({
    data: {
      rideId,
      passengerId,
      seats,
    },
    include: { ride: true, passenger: true },
  });

  res.status(201).json({ success: true, booking });
};

export const cancelBooking = async (req: Request, res: Response) => {
  const passengerId = req.user?.id;
  if (!passengerId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!id) {
    return res.status(400).json({ success: false, message: 'Identifiant réservation manquant' });
  }

  const booking = await prisma.booking.updateMany({
    where: { id, passengerId, status: 'CONFIRMED' },
    data: { status: 'CANCELLED' },
  });

  if (booking.count === 0) {
    return res.status(404).json({ success: false, message: 'Réservation introuvable ou déjà annulée' });
  }

  res.json({ success: true, message: 'Réservation annulée' });
};

export const getMyBookings = async (req: Request, res: Response) => {
  const passengerId = req.user?.id;
  if (!passengerId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const bookings = await prisma.booking.findMany({
    where: { passengerId },
    include: { ride: { include: { driver: { include: { user: true } }, vehicle: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, bookings });
};

export const getBookingsByRide = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const rideId = typeof req.params.rideId === 'string' ? req.params.rideId : req.params.rideId?.[0];
  if (!rideId) {
    return res.status(400).json({ success: false, message: 'rideId requis' });
  }

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { driver: true },
  });

  if (!ride) {
    return res.status(404).json({ success: false, message: 'Trajet introuvable' });
  }

  if (ride.driver.userId !== userId) {
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  }

  const bookings = await prisma.booking.findMany({
    where: { rideId },
    include: { passenger: true },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ success: true, bookings });
};
