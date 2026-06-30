import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/authRequest';
export declare const authenticateJWT: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authenticateSocket: (socket: any, next: any) => any;
//# sourceMappingURL=auth.d.ts.map