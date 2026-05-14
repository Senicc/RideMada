import { Request, Response, NextFunction } from 'express';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Utilisateur non authentifié" });
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Accès refusé. Rôle requis : ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Middleware spécifique Conducteur
export const isDriver = authorizeRoles('DRIVER');

// Middleware Admin
export const isAdmin = authorizeRoles('ADMIN');