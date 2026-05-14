import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.post('/', authenticateJWT, bookingController.createBooking);
router.delete('/:id', authenticateJWT, bookingController.cancelBooking);
router.get('/my-bookings', authenticateJWT, bookingController.getMyBookings);
router.get('/ride/:rideId', authenticateJWT, bookingController.getBookingsByRide);

export default router;