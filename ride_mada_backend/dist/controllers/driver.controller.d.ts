import type { Request, Response } from 'express';
export declare const becomeDriver: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateDriverLocation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDriverStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDriverProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=driver.controller.d.ts.map