import prisma from '../config/db';
import type { AuthRequest } from '../types/authRequest';
import { calculateHaversineDistance } from '../utils/distance';
import { estimateTripFare, type FareVehicleType } from '../utils/pricing';
import { NotificationService } from '../services/notification.service';
import { getIO } from '../sockets/io';
import { getDirections } from '../services/googleMaps.service';
import type { Response } from 'express';
import type { RideRequestStatus, VehicleType } from '@prisma/client';

const NEARBY_KM = 15;

function serializeRideRequest(r: Record<string, unknown>) {
  return {
    ...r,
    estimatedPrice: r.estimatedPrice != null ? Number(r.estimatedPrice) : null,
    finalPrice: r.finalPrice != null ? Number(r.finalPrice) : null,
  };
}

async function notifyNearbyDrivers(requestId: string, lat: number, lng: number) {
  const io = getIO();
  if (!io) return;

  const drivers = await prisma.driver.findMany({
    where: { status: 'ONLINE', isApproved: true, currentLat: { not: null }, currentLng: { not: null } },
    include: { user: { select: { id: true, name: true } } },
  });

  const request = await prisma.rideRequest.findUnique({ where: { id: requestId } });
  if (!request) return;

  for (const driver of drivers) {
    const dist = calculateHaversineDistance(lat, lng, driver.currentLat!, driver.currentLng!);
    if (dist <= NEARBY_KM) {
      io.to(`user_${driver.userId}`).emit('newRideRequest', serializeRideRequest(request as unknown as Record<string, unknown>));
      await NotificationService.createInAppNotification(
        driver.userId,
        'Nouvelle course',
        `Demande à ${request.pickupAddress}`,
        'RIDE_UPDATE',
      );
      await NotificationService.sendPushNotification(
        driver.userId,
        'Nouvelle course',
        `Demande à ${request.pickupAddress}`,
        { type: 'RIDE_UPDATE', rideRequestId: requestId },
      );
    }
  }
}

export const createRideRequest = async (req: AuthRequest, res: Response) => {
  try {
    const passengerId = req.user?.id;
    if (!passengerId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const {
      pickupLat,
      pickupLng,
      pickupAddress,
      dropoffLat,
      dropoffLng,
      dropoffAddress,
      vehicleType,
      scheduledAt,
      couponCode,
    } = req.body;

    if (
      [pickupLat, pickupLng, dropoffLat, dropoffLng].some((v) => typeof v !== 'number') ||
      !pickupAddress ||
      !dropoffAddress
    ) {
      return res.status(400).json({ success: false, message: 'Coordonnées et adresses requises' });
    }

    const type = (vehicleType ?? 'SEDAN').toUpperCase() as FareVehicleType;
    const directions = await getDirections(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const estimate = estimateTripFare(pickupLat, pickupLng, dropoffLat, dropoffLng, type, {
      distanceKm: directions?.distanceKm,
      durationMin: directions?.durationMin
    });

    let finalEstimate = estimate.price;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
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

    const active = await prisma.rideRequest.findFirst({
      where: {
        passengerId,
        status: { in: ['REQUESTED', 'ACCEPTED', 'DRIVER_ARRIVING', 'IN_PROGRESS'] },
      },
    });
    if (active) {
      return res.status(409).json({ success: false, message: 'Vous avez déjà une course en cours' });
    }

    const rideRequest = await prisma.rideRequest.create({
      data: {
        passengerId,
        pickupLat,
        pickupLng,
        pickupAddress,
        dropoffLat,
        dropoffLng,
        dropoffAddress,
        vehicleType: type as VehicleType,
        estimatedPrice: finalEstimate,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        couponCode: couponCode ?? null,
      },
      include: {
        passenger: { select: { id: true, name: true, phone: true, photo: true } },
      },
    });

    await notifyNearbyDrivers(rideRequest.id, pickupLat, pickupLng);

    res.status(201).json({ success: true, rideRequest: serializeRideRequest(rideRequest as unknown as Record<string, unknown>) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    res.status(500).json({ success: false, message });
  }
};

export const getMyRideRequests = async (req: AuthRequest, res: Response) => {
  const passengerId = req.user?.id;
  if (!passengerId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const rideRequests = await prisma.rideRequest.findMany({
    where: { passengerId },
    include: {
      driver: { include: { user: { select: { id: true, name: true, photo: true, phone: true, rating: true } }, vehicles: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({
    success: true,
    rideRequests: rideRequests.map((r) => serializeRideRequest(r as unknown as Record<string, unknown>)),
  });
};

export const getPendingForDriver = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver?.isApproved) {
    return res.status(403).json({ success: false, message: 'Compte conducteur non validé' });
  }

  const lat = parseFloat(String(req.query.lat ?? driver.currentLat ?? ''));
  const lng = parseFloat(String(req.query.lng ?? driver.currentLng ?? ''));

  const requests = await prisma.rideRequest.findMany({
    where: { status: 'REQUESTED' },
    include: { passenger: { select: { id: true, name: true, photo: true, rating: true } } },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  const filtered =
    Number.isNaN(lat) || Number.isNaN(lng)
      ? requests
      : requests.filter(
          (r) => calculateHaversineDistance(lat, lng, r.pickupLat, r.pickupLng) <= NEARBY_KM,
        );

  res.json({
    success: true,
    rideRequests: filtered.map((r) => serializeRideRequest(r as unknown as Record<string, unknown>)),
  });
};

export const getRideRequestById = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!userId || !id) {
    return res.status(400).json({ success: false, message: 'Requête invalide' });
  }

  const rideRequest = await prisma.rideRequest.findUnique({
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

  res.json({ success: true, rideRequest: serializeRideRequest(rideRequest as unknown as Record<string, unknown>) });
};

async function updateStatus(
  req: AuthRequest,
  res: Response,
  allowedStatuses: RideRequestStatus[],
  nextStatus: RideRequestStatus,
  extra?: Record<string, unknown>,
) {
  const userId = req.user?.id;
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!userId || !id) {
    return res.status(400).json({ success: false, message: 'Requête invalide' });
  }

  const existing = await prisma.rideRequest.findUnique({
    where: { id },
    include: { driver: true, passenger: true },
  });
  if (!existing || !allowedStatuses.includes(existing.status)) {
    return res.status(400).json({ success: false, message: 'Transition de statut invalide' });
  }

  const rideRequest = await prisma.rideRequest.update({
    where: { id },
    data: { status: nextStatus, ...extra },
    include: {
      passenger: { select: { id: true, name: true, phone: true, photo: true } },
      driver: { include: { user: { select: { id: true, name: true, phone: true, photo: true } }, vehicles: true } },
    },
  });

  const io = getIO();
  io?.to(`user_${existing.passengerId}`).emit('rideRequestStatusUpdate', { id, status: nextStatus });
  if (existing.driverId && rideRequest.driver) {
    io?.to(`user_${rideRequest.driver.userId}`).emit('rideRequestStatusUpdate', { id, status: nextStatus });
  }
  io?.to(`ride_request_${id}`).emit('rideRequestStatusUpdate', { id, status: nextStatus });

  res.json({ success: true, rideRequest: serializeRideRequest(rideRequest as unknown as Record<string, unknown>) });
}

export const acceptRideRequest = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!userId || !id) {
    return res.status(400).json({ success: false, message: 'Requête invalide' });
  }

  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver?.isApproved) {
    return res.status(403).json({ success: false, message: 'Compte conducteur non validé' });
  }

  const onRide = await prisma.rideRequest.findFirst({
    where: { driverId: driver.id, status: { in: ['ACCEPTED', 'DRIVER_ARRIVING', 'IN_PROGRESS'] } },
  });
  if (onRide) {
    return res.status(409).json({ success: false, message: 'Vous avez déjà une course active' });
  }

  const existing = await prisma.rideRequest.findUnique({ where: { id } });
  if (!existing || existing.status !== 'REQUESTED') {
    return res.status(400).json({ success: false, message: 'Course indisponible' });
  }

  const rideRequest = await prisma.$transaction(async (tx) => {
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

  const io = getIO();
  io?.to(`user_${existing.passengerId}`).emit('rideRequestAccepted', serializeRideRequest(rideRequest as unknown as Record<string, unknown>));
  await NotificationService.createInAppNotification(
    existing.passengerId,
    'Chauffeur trouvé',
    'Un chauffeur a accepté votre course',
    'RIDE_UPDATE',
  );

  res.json({ success: true, rideRequest: serializeRideRequest(rideRequest as unknown as Record<string, unknown>) });
};

export const rejectRideRequest = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Course refusée' });
};

export const driverArriving = async (req: AuthRequest, res: Response) => {
  return updateStatus(req, res, ['ACCEPTED'], 'DRIVER_ARRIVING');
};

export const startRideRequest = async (req: AuthRequest, res: Response) => {
  return updateStatus(req, res, ['ACCEPTED', 'DRIVER_ARRIVING'], 'IN_PROGRESS');
};

export const completeRideRequest = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!userId || !id) {
    return res.status(400).json({ success: false, message: 'Requête invalide' });
  }

  const existing = await prisma.rideRequest.findUnique({
    where: { id },
    include: { driver: true },
  });
  if (!existing || existing.status !== 'IN_PROGRESS') {
    return res.status(400).json({ success: false, message: 'Course non démarrée' });
  }
  if (existing.driver?.userId !== userId) {
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  }

  const rideRequest = await prisma.$transaction(async (tx) => {
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

  const io = getIO();
  io?.to(`ride_request_${id}`).emit('rideRequestCompleted', { id });
  await NotificationService.createInAppNotification(
    existing.passengerId,
    'Course terminée',
    'Merci d\'avoir voyagé avec RideMada',
    'RIDE_UPDATE',
  );

  res.json({ success: true, rideRequest: serializeRideRequest(rideRequest as unknown as Record<string, unknown>) });
};

export const cancelRideRequest = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!userId || !id) {
    return res.status(400).json({ success: false, message: 'Requête invalide' });
  }

  const existing = await prisma.rideRequest.findUnique({
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

  const rideRequest = await prisma.$transaction(async (tx) => {
    const updated = await tx.rideRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    if (existing.driverId) {
      await tx.driver.update({ where: { id: existing.driverId }, data: { status: 'ONLINE' } });
    }
    return updated;
  });

  getIO()?.to(`ride_request_${id}`).emit('rideRequestCancelled', { id });

  res.json({ success: true, rideRequest: serializeRideRequest(rideRequest as unknown as Record<string, unknown>) });
};

export const getDriverActiveRide = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Profil conducteur introuvable' });
  }

  const rideRequest = await prisma.rideRequest.findFirst({
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
      ? serializeRideRequest(rideRequest as unknown as Record<string, unknown>)
      : null,
  });
};

export const getDriverRideHistory = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Profil conducteur introuvable' });
  }

  const [rideRequests, sharedRides] = await Promise.all([
    prisma.rideRequest.findMany({
      where: { driverId: driver.id },
      include: { passenger: { select: { id: true, name: true, photo: true, rating: true } } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.ride.findMany({
      where: { driverId: driver.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { vehicle: true, bookings: true },
    }),
  ]);

  res.json({
    success: true,
    rideRequests: rideRequests.map((r) => serializeRideRequest(r as unknown as Record<string, unknown>)),
    sharedRides,
  });
};
