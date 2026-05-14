import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "Accès non autorisé - Token manquant" });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token manquant' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, message: 'JWT_SECRET non configuré' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded as Express.Request['user'];
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: "Token expiré" });
    }
    return res.status(403).json({ success: false, message: "Token invalide" });
  }
};

// Optionnel : Authentification Socket.IO
export const authenticateSocket = (socket: any, next: any) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return next(new Error('JWT_SECRET non configuré'));
    const decoded = jwt.verify(token, secret);
    socket.user = decoded as { id: string; role?: string };
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};