import { body } from 'express-validator';

export const createRideValidation = [
  body('departureLat').isFloat({ min: -90, max: 90 }),
  body('departureLng').isFloat({ min: -180, max: 180 }),
  body('arrivalLat').isFloat({ min: -90, max: 90 }),
  body('arrivalLng').isFloat({ min: -180, max: 180 }),
  body('price').isFloat({ min: 500 }),
  body('availableSeats').isInt({ min: 1, max: 8 }),
  body('departureTime').isISO8601(),
];