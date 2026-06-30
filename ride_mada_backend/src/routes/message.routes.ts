import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticateJWT } from '../middlewares/auth';
import { ensureActiveUser } from '../middlewares/ensureActiveUser';

const router = Router();

router.use(authenticateJWT, ensureActiveUser);

router.get('/chat/:userId', messageController.getChatHistory);
router.post('/', messageController.sendMessage);

export default router;
