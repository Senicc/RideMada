import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
import prisma from '../config/db';
import { PaymentService } from '../services/payment.service';
import type { MobileMoneyProvider } from '../services/mobileMoney.service';
import { NotificationService } from '../services/notification.service';

const MOBILE_METHODS = ['MVOLA', 'ORANGE', 'AIRTEL'] as const;

export const initiatePayment = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { bookingId, rideRequestId, method, phone } = req.body;
  const payMethod = (method ?? 'CASH').toUpperCase();

  let amount = 0;
  let existingWhere: Record<string, unknown> = {};

  if (rideRequestId) {
    const rideRequest = await prisma.rideRequest.findUnique({ where: { id: rideRequestId } });
    if (!rideRequest || rideRequest.passengerId !== userId) {
      return res.status(403).json({ success: false, message: 'Course introuvable' });
    }
    amount = Number(rideRequest.finalPrice ?? rideRequest.estimatedPrice);
    existingWhere = { rideRequestId };
  } else {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { ride: true },
    });
    if (!booking || booking.passengerId !== userId) {
      return res.status(403).json({ success: false, message: 'Réservation introuvable' });
    }
    amount = Number(booking.ride.price) * booking.seats;
    existingWhere = { bookingId };
  }

  const existing = await prisma.payment.findFirst({
    where: { ...existingWhere, status: { in: ['PENDING', 'COMPLETED', 'PROCESSING'] } },
  });
  if (existing) {
    return res.json({ success: true, payment: { ...existing, amount: Number(existing.amount) } });
  }

  const isMobile = MOBILE_METHODS.includes(payMethod as (typeof MOBILE_METHODS)[number]);
  const payment = await prisma.payment.create({
    data: {
      bookingId: bookingId ?? null,
      rideRequestId: rideRequestId ?? null,
      userId,
      amount,
      method: payMethod,
      status: payMethod === 'CASH' ? 'PENDING' : isMobile ? 'PROCESSING' : 'PROCESSING',
    },
  });

  if (isMobile) {
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Numéro mobile money requis' });
    }
    try {
      const result = await PaymentService.processMobileMoney(
        payment.id,
        payMethod as MobileMoneyProvider,
        phone,
      );
      return res.status(201).json({
        success: true,
        payment: { ...result.payment, amount: Number(result.payment.amount) },
        instructions: result.instructions,
        transactionRef: result.transactionRef,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur mobile money';
      return res.status(400).json({ success: false, message });
    }
  }

  res.status(201).json({ success: true, payment: { ...payment, amount: Number(payment.amount) } });
};

export const confirmCashPayment = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  try {
    const { bookingId, rideRequestId } = req.body;
    if (rideRequestId) {
      const result = await PaymentService.confirmCashPaymentForRideRequest(rideRequestId, userId);
      return res.json({ success: true, payment: { ...result, amount: Number(result.amount) } });
    }
    const result = await PaymentService.confirmCashPayment(bookingId, userId);
    res.json({ success: true, payment: { ...result, amount: Number(result.amount) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur paiement';
    res.status(400).json({ success: false, message });
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!userId || !id) {
    return res.status(400).json({ success: false, message: 'Requête invalide' });
  }

  try {
    const payment = await PaymentService.getPaymentStatus(id, userId);
    res.json({ success: true, payment: { ...payment, amount: Number(payment.amount) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Paiement introuvable';
    res.status(404).json({ success: false, message });
  }
};

export const mobileMoneyWebhook = async (req: AuthRequest, res: Response) => {
  const provider = String(req.params.provider ?? '').toUpperCase() as MobileMoneyProvider;
  if (!['MVOLA', 'ORANGE', 'AIRTEL'].includes(provider)) {
    return res.status(400).json({ success: false, message: 'Provider invalide' });
  }

  const result = await PaymentService.handleWebhook(provider, req.body);
  if (!result) {
    return res.status(400).json({ success: false, message: 'Webhook non vérifié' });
  }

  res.json({ success: true, payment: { ...result, amount: Number(result.amount) } });
};

export const getPaymentHistory = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const payments = await prisma.payment.findMany({
    where: { userId },
    include: { booking: { include: { ride: true } }, rideRequest: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    payments: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
  });
};

export const triggerSos = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { lat, lng, rideRequestId, message } = req.body;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, phone: true } });

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  });

  const alertBody = `SOS de ${user?.name ?? 'utilisateur'} (${user?.phone}) — ${message ?? 'Urgence'}`;
  for (const admin of admins) {
    await NotificationService.createInAppNotification(admin.id, '🚨 ALERTE SOS', alertBody, 'SOS');
    await NotificationService.sendPushNotification(admin.id, '🚨 ALERTE SOS', alertBody, {
      type: 'SOS',
      rideRequestId: rideRequestId ?? '',
      lat: String(lat ?? ''),
      lng: String(lng ?? ''),
    });
  }

  res.json({ success: true, message: 'Alerte SOS envoyée au support' });
};
