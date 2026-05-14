import { Router } from 'express';
import * as driverController from '../controllers/driver.controller';
import { authenticateJWT } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

router.post('/become-driver', authenticateJWT, authorizeRoles('PASSENGER'), driverController.becomeDriver);
router.put('/location', authenticateJWT, authorizeRoles('DRIVER'), driverController.updateDriverLocation);
router.get('/status', authenticateJWT, authorizeRoles('DRIVER'), driverController.getDriverStatus);
router.get('/me', authenticateJWT, authorizeRoles('DRIVER'), driverController.getDriverProfile);

export default router;