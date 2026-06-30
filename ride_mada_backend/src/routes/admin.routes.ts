import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticateJWT } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

router.get('/users', authenticateJWT, authorizeRoles('ADMIN'), adminController.getAllUsers);
router.get('/drivers/pending', authenticateJWT, authorizeRoles('ADMIN'), adminController.getPendingDrivers);
router.put('/drivers/:id/approve', authenticateJWT, authorizeRoles('ADMIN'), adminController.approveDriver);
router.put('/drivers/:id/reject', authenticateJWT, authorizeRoles('ADMIN'), adminController.rejectDriver);
router.get('/payments', authenticateJWT, authorizeRoles('ADMIN'), adminController.getPayments);
router.get('/export/payments', authenticateJWT, authorizeRoles('ADMIN'), adminController.exportPaymentsCsv);
router.get('/export/users', authenticateJWT, authorizeRoles('ADMIN'), adminController.exportUsersCsv);
router.get('/logs', authenticateJWT, authorizeRoles('ADMIN'), adminController.getAdminLogs);
router.get('/statistics', authenticateJWT, authorizeRoles('ADMIN'), adminController.getStatistics);
router.get('/rides/active', authenticateJWT, authorizeRoles('ADMIN'), adminController.getActiveRides);
router.get('/reports', authenticateJWT, authorizeRoles('ADMIN'), adminController.getReports);
router.put('/reports/:id/resolve', authenticateJWT, authorizeRoles('ADMIN'), adminController.resolveReport);
router.post('/block-user/:id', authenticateJWT, authorizeRoles('ADMIN'), adminController.blockUser);
router.post('/unblock-user/:id', authenticateJWT, authorizeRoles('ADMIN'), adminController.unblockUser);

export default router;