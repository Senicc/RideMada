import { Request, Response, NextFunction } from 'express';
export declare const apiLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authRateLimit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rateLimit.d.ts.map