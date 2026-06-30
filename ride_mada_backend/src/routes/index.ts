import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import driverRoutes from './driver.routes';
import vehicleRoutes from './vehicle.routes';
import rideRoutes from './ride.routes';
import bookingRoutes from './booking.routes';
import messageRoutes from './message.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';
import adminRoutes from './admin.routes';
import rideRequestRoutes from './rideRequest.routes';
import notificationRoutes from './notification.routes';
import couponRoutes from './coupon.routes';
import reportRoutes from './report.routes';
import mapRoutes from './map.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/drivers', driverRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/rides', rideRoutes);
router.use('/ride-requests', rideRequestRoutes);
router.use('/bookings', bookingRoutes);
router.use('/messages', messageRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/coupons', couponRoutes);
router.use('/reports', reportRoutes);
router.use('/maps', mapRoutes);
router.use('/admin', adminRoutes);

export default router;