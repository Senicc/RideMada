import { Request, Response } from 'express';
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const getPendingDrivers: (req: Request, res: Response) => Promise<void>;
export declare const approveDriver: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const rejectDriver: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getStatistics: (_req: Request, res: Response) => Promise<void>;
export declare const getActiveRides: (_req: Request, res: Response) => Promise<void>;
export declare const getReports: (_req: Request, res: Response) => Promise<void>;
export declare const resolveReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const unblockUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const blockUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPayments: (_req: Request, res: Response) => Promise<void>;
export declare const getAdminLogs: (_req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map