import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
export declare const apiLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authLimiter: RateLimiterMemory;
//# sourceMappingURL=rateLimit.d.ts.map