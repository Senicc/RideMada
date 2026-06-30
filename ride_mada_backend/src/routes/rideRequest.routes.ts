import { Router } from 'express';
import * as rideRequestController from '../controllers/rideRequest.controller';
import { authenticateJWT } from '../middlewares/auth';
import { ensureActiveUser } from '../middlewares/ensureActiveUser';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

router.use(authenticateJWT, ensureActiveUser);

router.post('/', rideRequestController.createRideRequest);
router.get('/my', rideRequestController.getMyRideRequests);
router.get('/pending', authorizeRoles('DRIVER'), rideRequestController.getPendingForDriver);
router.get('/driver/active', authorizeRoles('DRIVER'), rideRequestController.getDriverActiveRide);
router.get('/driver/history', authorizeRoles('DRIVER'), rideRequestController.getDriverRideHistory);
router.get('/:id', rideRequestController.getRideRequestById);
router.put('/:id/accept', authorizeRoles('DRIVER'), rideRequestController.acceptRideRequest);
router.put('/:id/reject', authorizeRoles('DRIVER'), rideRequestController.rejectRideRequest);
router.put('/:id/arriving', authorizeRoles('DRIVER'), rideRequestController.driverArriving);
router.put('/:id/start', authorizeRoles('DRIVER'), rideRequestController.startRideRequest);
router.put('/:id/complete', authorizeRoles('DRIVER'), rideRequestController.completeRideRequest);
router.put('/:id/cancel', rideRequestController.cancelRideRequest);

export default router;
