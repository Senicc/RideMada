import { Router } from 'express';
import multer from 'multer';
import * as userController from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.get('/profile', authenticateJWT, userController.getProfile);
router.put('/profile', authenticateJWT, upload.single('photo'), userController.updateProfile);
router.get('/history', authenticateJWT, userController.getActivityHistory);
router.get('/favorites', authenticateJWT, userController.getFavorites);

export default router;