import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/authRequest';
import prisma from '../config/db';

/** Vérifie que l'utilisateur JWT n'est pas bloqué. */
export const ensureActiveUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isBlocked: true },
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Compte suspendu' });
    }
    next();
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
