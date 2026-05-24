import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
import prisma from '../config/db';

export const createReview = async (req: AuthRequest, res: Response) => {
  const reviewerId = req.user?.id;
  if (!reviewerId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { rideId, reviewedId, rating, comment } = req.body;

  const review = await prisma.review.create({
    data: {
      reviewerId,
      reviewedId,
      rideId,
      rating,
      comment,
    },
  });

  res.status(201).json({ success: true, review });
};

export const getUserReviews = async (req: AuthRequest, res: Response) => {
  const reviewedId = typeof req.params.userId === 'string' ? req.params.userId : req.params.userId?.[0];
  if (!reviewedId) {
    return res.status(400).json({ success: false, message: 'userId requis' });
  }

  const reviews = await prisma.review.findMany({
    where: { reviewedId },
    include: { reviewer: { select: { name: true, photo: true } } },
  });
  res.json({ success: true, reviews });
};
