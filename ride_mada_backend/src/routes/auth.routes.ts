import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import * as bootstrapController from '../controllers/bootstrap.controller';
import { validate } from '../middlewares/validation';
import { authRateLimit } from '../middlewares/rateLimit';

const router = Router();

router.post('/bootstrap-admin', bootstrapController.bootstrapAdmin);

router.use(authRateLimit);

router.post('/register', [
  body('phone').isMobilePhone('any').withMessage('Numéro de téléphone invalide'),
  body('name').notEmpty().trim(),
  body('password').isLength({ min: 6 }),
], validate, authController.register);

router.post('/login', [
  body('phone').notEmpty(),
  body('password').notEmpty(),
], validate, authController.login);

router.post('/refresh', [
  body('refreshToken').notEmpty(),
], validate, authController.refreshToken);

router.post('/verify-otp', [
  body('phone').notEmpty(),
  body('otp').notEmpty(),
], validate, authController.verifyOTP);
router.post('/forgot-password', [
  body('phone').notEmpty(),
], validate, authController.forgotPassword);

router.post('/reset-password', [
  body('phone').notEmpty(),
  body('otp').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], validate, authController.resetPassword);

router.post('/logout', authController.logout);

export default router;