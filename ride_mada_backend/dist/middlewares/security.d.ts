import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/authRequest';
export declare const antiFakeGPS: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const securityHeaders: (_req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=security.d.ts.map