import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
export declare const createRide: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getNearbyRides: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const findNearbyDrivers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getRideById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateRide: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelRide: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const estimateFare: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllRides: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=ride.controller.d.ts.map