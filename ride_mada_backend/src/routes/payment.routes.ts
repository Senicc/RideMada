import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.post('/initiate', authenticateJWT, paymentController.initiatePayment);
router.post('/confirm-cash', authenticateJWT, paymentController.confirmCashPayment);
router.get('/history', authenticateJWT, paymentController.getPaymentHistory);

export default router;