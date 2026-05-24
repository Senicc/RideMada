import type { Request } from 'express';

/**
 * Extension de Request avec la propriété `user` injectée par le middleware JWT.
 * Utilisé dans tous les controllers et middlewares qui accèdent à req.user.
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
    iat?: number;
    exp?: number;
  };
}
