import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import type { Express } from 'express';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadBuffer(buffer: Buffer): Promise<unknown> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: 'ridemada/profiles', transformation: [{ width: 400, crop: 'limit' }] },
        (error, result) => (error ? reject(error) : resolve(result)),
      )
      .end(buffer);
  });
}

export const uploadToCloudinary = async (file: Express.Multer.File): Promise<{ secure_url?: string }> => {
  if (file.buffer) {
    return uploadBuffer(file.buffer) as Promise<{ secure_url?: string }>;
  }
  if (file.path) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'ridemada/profiles',
        transformation: [{ width: 400, crop: 'limit' }],
      });
      return result;
    } finally {
      fs.unlink(file.path, () => undefined);
    }
  }
  throw new Error('Fichier invalide pour upload');
};
