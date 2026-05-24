import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
import prisma from '../config/db';

async function getDriverIdForUser(userId: string) {
  const driver = await prisma.driver.findUnique({ where: { userId } });
  return driver?.id ?? null;
}

export const addVehicle = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const driverId = await getDriverIdForUser(userId);
  if (!driverId) {
    return res.status(400).json({ success: false, message: 'Profil conducteur introuvable' });
  }

  const { brand, model, color, plate, seats, type } = req.body;

  const vehicle = await prisma.vehicle.create({
    data: {
      driverId,
      brand,
      model,
      color,
      plate,
      seats,
      type,
    },
  });

  res.status(201).json({ success: true, vehicle });
};

export const getMyVehicles = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const driverId = await getDriverIdForUser(userId);
  if (!driverId) {
    return res.status(400).json({ success: false, message: 'Profil conducteur introuvable' });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { driverId },
  });
  res.json({ success: true, vehicles });
};

export const updateVehicle = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const driverId = await getDriverIdForUser(userId);
  if (!driverId) {
    return res.status(400).json({ success: false, message: 'Profil conducteur introuvable' });
  }

  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!id) {
    return res.status(400).json({ success: false, message: 'Identifiant véhicule manquant' });
  }

  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing || existing.driverId !== driverId) {
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  }

  const { brand, model, color, plate, seats, type, isActive } = req.body;
  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      ...(brand !== undefined && { brand }),
      ...(model !== undefined && { model }),
      ...(color !== undefined && { color }),
      ...(plate !== undefined && { plate }),
      ...(seats !== undefined && { seats }),
      ...(type !== undefined && { type }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  res.json({ success: true, vehicle });
};

export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const driverId = await getDriverIdForUser(userId);
  if (!driverId) {
    return res.status(400).json({ success: false, message: 'Profil conducteur introuvable' });
  }

  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!id) {
    return res.status(400).json({ success: false, message: 'Identifiant véhicule manquant' });
  }

  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing || existing.driverId !== driverId) {
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  }

  await prisma.vehicle.delete({ where: { id } });
  res.json({ success: true, message: 'Véhicule supprimé' });
};
