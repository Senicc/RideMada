import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const isDev = process.env.NODE_ENV !== 'production';

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop volumineux (max 5 Mo)' : err.message,
    });
  }

  const statusCode = (err as { statusCode?: number })?.statusCode ?? 500;
  const message =
    isDev && err instanceof Error
      ? err.message
      : statusCode >= 500
        ? 'Erreur interne du serveur'
        : err instanceof Error
          ? err.message
          : 'Erreur';

  if (isDev && err instanceof Error) {
    console.error('[ERROR]', err.message, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && err instanceof Error && { stack: err.stack }),
  });
};
