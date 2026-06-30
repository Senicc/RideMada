import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
import prisma from '../config/db';
import { logAdminAction } from '../utils/adminLog';

export const validateCoupon = async (req: AuthRequest, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Code requis' });
  }

  const coupon = await prisma.coupon.findFirst({
    where: { code: code.toUpperCase(), isActive: true, validUntil: { gt: new Date() } },
  });

  if (!coupon || coupon.timesUsed >= coupon.usageLimit) {
    return res.status(404).json({ success: false, message: 'Code promo invalide ou expiré' });
  }

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      discount: Number(coupon.discount),
      type: coupon.type,
    },
  });
};

export const createCoupon = async (req: AuthRequest, res: Response) => {
  const adminId = req.user?.id;
  const { code, discount, type, validUntil, usageLimit } = req.body;

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      discount,
      type: type ?? 'FIXED',
      validUntil: new Date(validUntil),
      usageLimit: usageLimit ?? 100,
    },
  });

  if (adminId) {
    await logAdminAction(adminId, 'CREATE_COUPON', coupon.id, { code: coupon.code });
  }

  res.status(201).json({
    success: true,
    coupon: { ...coupon, discount: Number(coupon.discount) },
  });
};

export const listCoupons = async (_req: AuthRequest, res: Response) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({
    success: true,
    coupons: coupons.map((c) => ({ ...c, discount: Number(c.discount) })),
  });
};

export const deactivateCoupon = async (req: AuthRequest, res: Response) => {
  const adminId = req.user?.id;
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!id) {
    return res.status(400).json({ success: false, message: 'Identifiant manquant' });
  }

  const coupon = await prisma.coupon.update({
    where: { id },
    data: { isActive: false },
  });

  if (adminId) {
    await logAdminAction(adminId, 'DEACTIVATE_COUPON', id);
  }

  res.json({ success: true, coupon: { ...coupon, discount: Number(coupon.discount) } });
};
