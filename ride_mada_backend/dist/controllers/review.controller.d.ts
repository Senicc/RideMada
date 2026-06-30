import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
export declare const createReview: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserReviews: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=review.controller.d.ts.map