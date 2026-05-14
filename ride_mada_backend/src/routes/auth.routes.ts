import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validation';

const router = Router();

router.post('/register', [
  body('phone').isMobilePhone('any').withMessage('Numéro de téléphone invalide'),
  body('name').notEmpty().trim(),
  body('password').isLength({ min: 6 }),
], validate, authController.register);

router.post('/login', [
  body('phone').notEmpty(),
  body('password').notEmpty(),
], validate, authController.login);

router.post('/refresh', authController.refreshToken);
router.post('/verify-otp', authController.verifyOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/logout', authController.logout);

export default router;