import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller';
import { authenticateJWT } from '../middlewares/auth';
import { ensureActiveUser } from '../middlewares/ensureActiveUser';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

router.post('/validate', authenticateJWT, ensureActiveUser, couponController.validateCoupon);
router.get('/', authenticateJWT, authorizeRoles('ADMIN'), couponController.listCoupons);
router.post('/', authenticateJWT, authorizeRoles('ADMIN'), couponController.createCoupon);
router.delete('/:id', authenticateJWT, authorizeRoles('ADMIN'), couponController.deactivateCoupon);

export default router;
