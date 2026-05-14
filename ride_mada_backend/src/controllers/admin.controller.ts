import { Request, Response } from 'express';
import prisma from '../config/db';

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: { driver: true }
  });
  res.json({ success: true, users });
};

export const getPendingDrivers = async (req: Request, res: Response) => {
  const drivers = await prisma.driver.findMany({
    where: { isApproved: false },
    include: { user: true }
  });
  res.json({ success: true, drivers });
};

export const approveDriver = async (req: Request, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!id) {
    return res.status(400).json({ success: false, message: 'Identifiant conducteur manquant' });
  }

  const driver = await prisma.driver.update({
    where: { id },
    data: { isApproved: true },
  });
  res.json({ success: true, driver });
};

export const getStatistics = async (req: Request, res: Response) => {
  const totalUsers = await prisma.user.count();
  const totalRides = await prisma.ride.count();
  const totalBookings = await prisma.booking.count();

  res.json({
    success: true,
    stats: { totalUsers, totalRides, totalBookings }
  });
};

export const blockUser = async (req: Request, res: Response) => {
  // Implémenter logique de blocage
  res.json({ success: true, message: "Utilisateur bloqué" });
};