import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../utils/cloudinary';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// Middleware pour uploader directement sur Cloudinary
export const handleUpload = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();
  try {
    const result = await uploadToCloudinary(req.file);
    const merged: Record<string, unknown> = {
      ...((req.body && typeof req.body === 'object' && req.body !== null)
        ? (req.body as Record<string, unknown>)
        : {}),
    };
    merged.photo = (result as { secure_url?: string }).secure_url;
    (req as Request & { body: Record<string, unknown> }).body = merged;
    next();
  } catch (error) {
    next(error);
  }
};