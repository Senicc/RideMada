import { Router } from 'express';
import { query, body } from 'express-validator';
import * as rideController from '../controllers/ride.controller';
import { authenticateJWT } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

router.post('/', [
  authenticateJWT,
  authorizeRoles('DRIVER'),
  body('departureLat').isFloat(),
  body('departureLng').isFloat(),
  body('arrivalLat').isFloat(),
  body('arrivalLng').isFloat(),
  body('price').isFloat({ min: 1000 }),
  body('availableSeats').isInt({ min: 1 }),
], rideController.createRide);

router.get('/nearby', [
  query('lat').isFloat(),
  query('lng').isFloat(),
], rideController.getNearbyRides);

router.get('/nearby-drivers', rideController.findNearbyDrivers);

router.get('/:id', rideController.getRideById);
router.put('/:id', authenticateJWT, authorizeRoles('DRIVER'), rideController.updateRide);
router.delete('/:id', authenticateJWT, authorizeRoles('DRIVER'), rideController.cancelRide);

router.get('/', rideController.getAllRides); // Avec filtres

export default router;