import { Request, Response, NextFunction } from 'express';
export declare const authenticateJWT: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authenticateSocket: (socket: any, next: any) => any;
//# sourceMappingURL=auth.d.ts.map