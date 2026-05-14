import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Erreur de validation",
      errors: errors.array()
    });
  }
  next();
};

// Validation personnalisée GPS
export const validateCoordinates = (req: Request, res: Response, next: NextFunction) => {
  const { departureLat, departureLng, arrivalLat, arrivalLng } = req.body;

  const isValidLat = (lat: number) => lat >= -90 && lat <= 90;
  const isValidLng = (lng: number) => lng >= -180 && lng <= 180;

  if (
    !isValidLat(departureLat) || !isValidLng(departureLng) ||
    !isValidLat(arrivalLat) || !isValidLng(arrivalLng)
  ) {
    return res.status(400).json({ success: false, message: "Coordonnées GPS invalides" });
  }
  next();
};