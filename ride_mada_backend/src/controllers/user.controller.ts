import type { Request, Response } from 'express';
import prisma from '../config/db';
import { uploadToCloudinary } from '../utils/cloudinary';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true },
    });
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const { name, email } = req.body;
    let photoUrl: string | undefined = undefined;

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file);
      photoUrl = (uploaded as { secure_url?: string }).secure_url;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email, ...(photoUrl && { photo: photoUrl }) },
    });

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivityHistory = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const bookings = await prisma.booking.findMany({
    where: { passengerId: userId },
    include: { ride: { include: { driver: { include: { user: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, bookings });
};

export const getFavorites = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, favorites });
};
