import { Router } from 'express';
import { query, body } from 'express-validator';
import * as rideController from '../controllers/ride.controller';
import { authenticateJWT } from '../middlewares/auth';
import { ensureActiveUser } from '../middlewares/ensureActiveUser';
import { authorizeRoles } from '../middlewares/role';
import { validate } from '../middlewares/validation';

const router = Router();

router.post(
  '/',
  authenticateJWT,
  ensureActiveUser,
  authorizeRoles('DRIVER'),
  [
    body('departureLat').isFloat(),
    body('departureLng').isFloat(),
    body('arrivalLat').isFloat(),
    body('arrivalLng').isFloat(),
    body('departureAddress').notEmpty(),
    body('arrivalAddress').notEmpty(),
    body('departureTime').notEmpty(),
    body('vehicleId').isUUID(),
    body('price').isFloat({ min: 1000 }),
    body('availableSeats').isInt({ min: 1 }),
  ],
  validate,
  rideController.createRide,
);

router.get(
  '/nearby',
  [
    query('lat').isFloat(),
    query('lng').isFloat(),
  ],
  validate,
  rideController.getNearbyRides,
);

router.get(
  '/estimate-fare',
  [
    query('departureLat').isFloat(),
    query('departureLng').isFloat(),
    query('arrivalLat').isFloat(),
    query('arrivalLng').isFloat(),
    query('vehicleType').optional().isIn(['SEDAN', 'SUV', 'MINIBUS', 'MOTORCYCLE']),
  ],
  validate,
  rideController.estimateFare,
);

router.get(
  '/nearby-drivers',
  [
    query('lat').optional().isFloat(),
    query('lng').optional().isFloat(),
  ],
  validate,
  rideController.findNearbyDrivers,
);

router.get('/:id', rideController.getRideById);
router.put('/:id', authenticateJWT, ensureActiveUser, authorizeRoles('DRIVER'), rideController.updateRide);
router.delete('/:id', authenticateJWT, ensureActiveUser, authorizeRoles('DRIVER'), rideController.cancelRide);
router.get('/', rideController.getAllRides);

export default router;
