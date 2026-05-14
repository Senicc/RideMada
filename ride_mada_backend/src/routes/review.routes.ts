import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.post('/', authenticateJWT, reviewController.createReview);
router.get('/user/:userId', reviewController.getUserReviews);

export default router;