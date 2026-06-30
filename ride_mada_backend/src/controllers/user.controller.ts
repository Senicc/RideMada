import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/db';
import { uploadToCloudinary } from '../utils/cloudinary';
import { publicUserSelect } from '../utils/userPublic';

// Interface locale pour typer req.user sans dépendre de l'augmentation globale
interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
    iat?: number;
    exp?: number;
  };
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...publicUserSelect,
        driver: { select: { id: true, status: true, isApproved: true, rating: true } },
      },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }
    res.json({ success: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    res.status(500).json({ success: false, message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
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
      select: publicUserSelect,
    });

    res.json({ success: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    res.status(500).json({ success: false, message });
  }
};

export const getActivityHistory = async (req: AuthRequest, res: Response) => {
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

export const getFavorites = async (req: AuthRequest, res: Response) => {
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

export const addFavorite = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { type, targetId, label, address, lat, lng } = req.body;
  if (!type) {
    return res.status(400).json({ success: false, message: 'type requis' });
  }

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_type_targetId: {
        userId,
        type,
        targetId: targetId ?? `${type}_${userId}`,
      },
    },
    create: {
      userId,
      type,
      targetId: targetId ?? `${type}_${userId}`,
      label,
      address,
      lat,
      lng,
    },
    update: { label, address, lat, lng },
  });

  res.status(201).json({ success: true, favorite });
};

export const deleteFavorite = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
  if (!userId || !id) {
    return res.status(400).json({ success: false, message: 'Requête invalide' });
  }

  const deleted = await prisma.favorite.deleteMany({ where: { id, userId } });
  if (deleted.count === 0) {
    return res.status(404).json({ success: false, message: 'Favori introuvable' });
  }

  res.json({ success: true, message: 'Favori supprimé' });
};

export const updateFcmToken = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const { fcmToken } = req.body;
    if (!fcmToken || typeof fcmToken !== 'string') {
      return res.status(400).json({ success: false, message: 'fcmToken requis' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });

    res.json({ success: true, message: 'Token FCM enregistré' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    res.status(500).json({ success: false, message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'Mot de passe actuel et nouveau (6+ car.) requis' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    res.json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    res.status(500).json({ success: false, message });
  }
};
