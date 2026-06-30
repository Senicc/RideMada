import type { Request, Response } from 'express';
export declare const geocode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const reverse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const autocomplete: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const directions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=map.controller.d.ts.map