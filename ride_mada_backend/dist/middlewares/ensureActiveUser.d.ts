import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/authRequest';
/** Vérifie que l'utilisateur JWT n'est pas bloqué. */
export declare const ensureActiveUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=ensureActiveUser.d.ts.map