import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.get('/chat/:userId', authenticateJWT, messageController.getChatHistory);
router.post('/', authenticateJWT, messageController.sendMessage);

export default router;