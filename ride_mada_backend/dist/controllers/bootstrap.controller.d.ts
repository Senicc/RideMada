import type { Request, Response } from 'express';
/** Crée le premier admin (dev uniquement). POST body: { secret, phone, name, password } */
export declare const bootstrapAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=bootstrap.controller.d.ts.map