import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticateJWT } from '../middlewares/auth';
import { ensureActiveUser } from '../middlewares/ensureActiveUser';

const router = Router();

router.post('/webhook/:provider', paymentController.mobileMoneyWebhook);

router.use(authenticateJWT, ensureActiveUser);

router.post('/initiate', paymentController.initiatePayment);
router.post('/confirm-cash', paymentController.confirmCashPayment);
router.post('/sos', paymentController.triggerSos);
router.get('/history', paymentController.getPaymentHistory);
router.get('/:id/status', paymentController.getPaymentStatus);

export default router;
