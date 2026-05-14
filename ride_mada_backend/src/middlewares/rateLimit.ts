import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

const rateLimiter = new RateLimiterMemory({
  points: 30,           // 30 requêtes
  duration: 60,         // par minute
});

export const apiLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rateLimiter.consume(req.ip!);
    next();
  } catch (err) {
    res.status(429).json({
      success: false,
      message: "Trop de requêtes. Veuillez réessayer plus tard."
    });
  }
};

// Rate limit plus strict pour login / register
export const authLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 15, // 5 tentatives toutes les 15 minutes
});