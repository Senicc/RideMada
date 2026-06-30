import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
export declare const validateCoupon: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCoupon: (req: AuthRequest, res: Response) => Promise<void>;
export declare const listCoupons: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const deactivateCoupon: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=coupon.controller.d.ts.map