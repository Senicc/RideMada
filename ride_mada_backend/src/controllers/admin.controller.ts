import { Request, Response } from 'express';
import prisma from '../config/db';
import { publicUserSelect } from '../utils/userPublic';

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      ...publicUserSelect,
      isBlocked: true,
      driver: { select: { id: true, isApproved: true, status: true } },
    },
    take: 100,
    orderBy: { createdAt: 'desc' },
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
  await prisma.user.update({
    where: { id: driver.userId },
    data: { role: 'DRIVER' },
  });
  res.json({ success: true, driver });
};

export const getStatistics = async (_req: Request, res: Response) => {
  const [
    totalUsers,
    totalDrivers,
    approvedDrivers,
    pendingDrivers,
    totalRides,
    activeRides,
    totalBookings,
    pendingReports,
    revenueAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.driver.count(),
    prisma.driver.count({ where: { isApproved: true } }),
    prisma.driver.count({ where: { isApproved: false } }),
    prisma.ride.count(),
    prisma.ride.count({ where: { status: 'ACTIVE' } }),
    prisma.booking.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalDrivers,
      approvedDrivers,
      pendingDrivers,
      totalRides,
      activeRides,
      totalBookings,
      pendingReports,
      totalRevenue: Number(revenueAgg._sum.amount ?? 0),
    },
  });
};

export const getActiveRides = async (_req: Request, res: Response) => {
  const rides = await prisma.ride.findMany({
    where: { status: { in: ['PENDING', 'ACTIVE'] } },
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      driver: { include: { user: { select: { id: true, name: true, phone: true } } } },
      vehicle: true,
      bookings: { include: { passenger: { select: { id: true, name: true, phone: true } } } },
    },
  });
  res.json({ success: true, rides });
};

export const getReports = async (_req: Request, res: Response) => {
  const reports = await prisma.report.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: { select: { id: true, name: true, phone: true } },
      reported: { select: { id: true, name: true, phone: true } },
    },
  });
  res.json({ success: true, reports });
};

export const resolveReport = async (req: Request, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!id) {
    return res.status(400).json({ success: false, message: 'Identifiant signalement manquant' });
  }
  const report = await prisma.report.update({
    where: { id },
    data: { status: 'RESOLVED' },
  });
  res.json({ success: true, report });
};

export const unblockUser = async (req: Request, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!id) {
    return res.status(400).json({ success: false, message: 'Identifiant utilisateur manquant' });
  }
  const user = await prisma.user.update({
    where: { id },
    data: { isBlocked: false },
    select: { id: true, name: true, phone: true, isBlocked: true },
  });
  res.json({ success: true, message: 'Utilisateur débloqué', user });
};

export const blockUser = async (req: Request, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!id) {
    return res.status(400).json({ success: false, message: 'Identifiant utilisateur manquant' });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isBlocked: true },
    select: { id: true, name: true, phone: true, isBlocked: true },
  });

  res.json({ success: true, message: 'Utilisateur bloqué', user });
};