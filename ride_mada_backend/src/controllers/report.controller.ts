import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
import prisma from '../config/db';

export const createReport = async (req: AuthRequest, res: Response) => {
  const reporterId = req.user?.id;
  if (!reporterId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { reportedId, reason } = req.body;
  if (!reportedId || !reason?.trim()) {
    return res.status(400).json({ success: false, message: 'reportedId et reason requis' });
  }

  if (reportedId === reporterId) {
    return res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous signaler vous-même' });
  }

  const report = await prisma.report.create({
    data: { reporterId, reportedId, reason: reason.trim().slice(0, 1000) },
  });

  res.status(201).json({ success: true, report });
};
