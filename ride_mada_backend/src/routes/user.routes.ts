import { Router } from 'express';
import multer from 'multer';
import * as userController from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth';
import { ensureActiveUser } from '../middlewares/ensureActiveUser';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Seules les images sont autorisées'));
  },
});

const router = Router();

router.use(authenticateJWT, ensureActiveUser);

router.get('/profile', userController.getProfile);
router.put('/profile', upload.single('photo'), userController.updateProfile);
router.get('/history', userController.getActivityHistory);
router.get('/favorites', userController.getFavorites);
router.patch('/fcm-token', userController.updateFcmToken);

export default router;
