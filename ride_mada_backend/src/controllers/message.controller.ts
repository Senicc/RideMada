import type { Request, Response } from 'express';
import prisma from '../config/db';

export const getChatHistory = async (req: Request, res: Response) => {
  const currentUserId = req.user?.id;
  if (!currentUserId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const peerId = typeof req.params.userId === 'string' ? req.params.userId : req.params.userId?.[0];
  if (!peerId) {
    return res.status(400).json({ success: false, message: 'userId requis' });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: peerId },
        { senderId: peerId, receiverId: currentUserId },
      ],
    },
    include: { sender: { select: { name: true, photo: true } } },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ success: true, messages });
};

export const sendMessage = async (req: Request, res: Response) => {
  const senderId = req.user?.id;
  if (!senderId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { receiverId, content, rideId } = req.body;

  const message = await prisma.message.create({
    data: { senderId, receiverId, content, rideId },
    include: { sender: true },
  });

  res.status(201).json({ success: true, message });
};
