import type { Request, Response } from 'express';
import prisma from '../config/db';
import { PaymentService } from '../services/payment.service';

export const initiatePayment = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { bookingId, method } = req.body;

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      userId,
      amount: 0,
      method,
      status: method === 'CASH' ? 'PENDING' : 'PROCESSING',
    },
  });

  res.status(201).json({ success: true, payment });
};

export const confirmCashPayment = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { bookingId } = req.body;
  const result = await PaymentService.confirmCashPayment(bookingId, userId);
  res.json({ success: true, payment: result });
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const payments = await prisma.payment.findMany({
    where: { userId },
    include: { booking: { include: { ride: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, payments });
};
