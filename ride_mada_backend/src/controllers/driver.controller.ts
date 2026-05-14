import type { Request, Response } from 'express';
import prisma from '../config/db';

export const becomeDriver = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const { documents } = req.body;

    const driver = await prisma.driver.upsert({
      where: { userId },
      update: { documents, isApproved: false },
      create: {
        userId,
        documents,
        isApproved: false,
      },
    });

    res.json({ success: true, driver });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDriverLocation = async (req: Request, res: Response) => {
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

export const getDriverStatus = async (req: Request, res: Response) => {
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

export const getDriverProfile = async (req: Request, res: Response) => {
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
