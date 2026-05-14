import type { Request, Response } from 'express';
export declare const createRide: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getNearbyRides: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const findNearbyDrivers: (req: Request, res: Response) => Promise<void>;
export declare const getRideById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateRide: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelRide: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllRides: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=ride.controller.d.ts.map