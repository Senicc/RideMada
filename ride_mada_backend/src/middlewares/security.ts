import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/authRequest';

// Détection simple de Fake GPS (basé sur en-têtes ou vitesse future)
export const antiFakeGPS = (req: AuthRequest, res: Response, next: NextFunction) => {
  // En production, combiner avec vérification de vitesse + historique de positions
  const { speed, accuracy } = req.body;

  if (accuracy && accuracy > 100) { // Précision > 100m = suspect
    console.warn(`[ANTI-FAKE-GPS] Position suspecte de l'utilisateur ${req.user?.id}`);
    // Vous pouvez logger ou bloquer temporairement
  }

  next();
};

// Protection générale
export const securityHeaders = (_req: AuthRequest, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};