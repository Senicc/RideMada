import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authenticateJWT } from '../middlewares/auth';
import { ensureActiveUser } from '../middlewares/ensureActiveUser';

const router = Router();

router.use(authenticateJWT, ensureActiveUser);

router.post('/', bookingController.createBooking);
router.delete('/:id', bookingController.cancelBooking);
router.get('/my-bookings', bookingController.getMyBookings);
router.get('/ride/:rideId', bookingController.getBookingsByRide);

export default router;