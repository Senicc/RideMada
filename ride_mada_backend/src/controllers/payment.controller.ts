import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
import prisma from '../config/db';
import { PaymentService } from '../services/payment.service';

export const initiatePayment = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { bookingId, method } = req.body;
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { ride: true },
  });

  if (!booking || booking.passengerId !== userId) {
    return res.status(403).json({ success: false, message: 'Réservation introuvable' });
  }

  const amount = Number(booking.ride.price) * booking.seats;

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      userId,
      amount,
      method: method ?? 'CASH',
      status: method === 'CASH' ? 'PENDING' : 'PROCESSING',
    },
  });

  res.status(201).json({ success: true, payment: { ...payment, amount: Number(payment.amount) } });
};

export const confirmCashPayment = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  try {
    const { bookingId } = req.body;
    const result = await PaymentService.confirmCashPayment(bookingId, userId);
    res.json({ success: true, payment: { ...result, amount: Number(result.amount) } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur paiement';
    res.status(400).json({ success: false, message });
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const payments = await prisma.payment.findMany({
    where: { userId },
    include: { booking: { include: { ride: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    payments: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
  });
};
