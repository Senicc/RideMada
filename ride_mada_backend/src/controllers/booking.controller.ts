import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
import prisma from '../config/db';
import { NotificationService } from '../services/notification.service';

interface CreateBookingBody {
  rideId: string;
  seats: number;
}

export const createBooking = async (req: AuthRequest, res: Response) => {
  const passengerId = req.user?.id;
  if (!passengerId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { rideId, seats } = req.body as CreateBookingBody;
  if (!rideId || typeof seats !== 'number' || seats < 1) {
    return res.status(400).json({ success: false, message: 'rideId et seats valides requis' });
  }

  const ride = await prisma.ride.findUnique({
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

  const existing = await prisma.booking.findFirst({
    where: { rideId, passengerId, status: 'CONFIRMED' },
  });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Réservation déjà existante pour ce trajet' });
  }

  const booking = await prisma.$transaction(async (tx) => {
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

  const passenger = await prisma.user.findUnique({
    where: { id: passengerId },
    select: { name: true },
  });
  await NotificationService.notifyNewBooking(rideId, passenger?.name ?? 'Passager', seats);

  res.status(201).json({ success: true, booking });
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  const passengerId = req.user?.id;
  if (!passengerId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!id) {
    return res.status(400).json({ success: false, message: 'Identifiant réservation manquant' });
  }

  const existing = await prisma.booking.findFirst({
    where: { id, passengerId, status: 'CONFIRMED' },
  });
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Réservation introuvable ou déjà annulée' });
  }

  await prisma.$transaction(async (tx) => {
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

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  const passengerId = req.user?.id;
  if (!passengerId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const bookings = await prisma.booking.findMany({
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

export const getBookingsByRide = async (req: AuthRequest, res: Response) => {
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
    include: { passenger: { select: { id: true, name: true, phone: true, photo: true } } },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ success: true, bookings });
};
