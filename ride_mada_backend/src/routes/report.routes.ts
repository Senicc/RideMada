import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticateJWT } from '../middlewares/auth';
import { ensureActiveUser } from '../middlewares/ensureActiveUser';

const router = Router();

router.post('/', authenticateJWT, ensureActiveUser, reportController.createReport);

export default router;
