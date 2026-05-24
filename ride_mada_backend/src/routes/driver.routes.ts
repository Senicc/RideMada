import { Router } from 'express';
import * as driverController from '../controllers/driver.controller';
import { authenticateJWT } from '../middlewares/auth';
import { ensureActiveUser } from '../middlewares/ensureActiveUser';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

router.post('/become-driver', authenticateJWT, ensureActiveUser, driverController.becomeDriver);
router.put('/location', authenticateJWT, ensureActiveUser, authorizeRoles('DRIVER'), driverController.updateDriverLocation);
router.put('/status', authenticateJWT, ensureActiveUser, authorizeRoles('DRIVER'), driverController.updateDriverStatus);
router.get('/status', authenticateJWT, ensureActiveUser, authorizeRoles('DRIVER'), driverController.getDriverStatus);
router.get('/earnings', authenticateJWT, ensureActiveUser, authorizeRoles('DRIVER'), driverController.getDriverEarnings);
router.get('/me', authenticateJWT, ensureActiveUser, authorizeRoles('DRIVER'), driverController.getDriverProfile);

export default router;