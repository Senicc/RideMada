import type { Request, Response } from 'express';
export declare const initiatePayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const confirmCashPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPaymentHistory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=payment.controller.d.ts.map