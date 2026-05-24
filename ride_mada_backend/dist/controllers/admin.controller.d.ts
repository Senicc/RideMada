import { Request, Response } from 'express';
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const getPendingDrivers: (req: Request, res: Response) => Promise<void>;
export declare const approveDriver: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getStatistics: (req: Request, res: Response) => Promise<void>;
export declare const blockUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=admin.controller.d.ts.map