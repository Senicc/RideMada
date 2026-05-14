declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: string;
        iat?: number;
        exp?: number;
        [key: string]: unknown;
      };
      file?: Express.Multer.File;
    }
  }
}
