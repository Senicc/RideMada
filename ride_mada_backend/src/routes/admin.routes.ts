import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticateJWT } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

router.get('/users', authenticateJWT, authorizeRoles('ADMIN'), adminController.getAllUsers);
router.get('/drivers/pending', authenticateJWT, authorizeRoles('ADMIN'), adminController.getPendingDrivers);
router.put('/drivers/:id/approve', authenticateJWT, authorizeRoles('ADMIN'), adminController.approveDriver);
router.get('/statistics', authenticateJWT, authorizeRoles('ADMIN'), adminController.getStatistics);
router.post('/block-user/:id', authenticateJWT, authorizeRoles('ADMIN'), adminController.blockUser);

export default router;