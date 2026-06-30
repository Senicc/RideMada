import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
import prisma from '../config/db';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({ success: true, notifications });
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!userId || !id) {
    return res.status(400).json({ success: false, message: 'Requête invalide' });
  }

  const notification = await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });

  if (notification.count === 0) {
    return res.status(404).json({ success: false, message: 'Notification introuvable' });
  }

  res.json({ success: true, message: 'Notification lue' });
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  res.json({ success: true, message: 'Toutes les notifications sont lues' });
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const count = await prisma.notification.count({ where: { userId, isRead: false } });
  res.json({ success: true, count });
};
