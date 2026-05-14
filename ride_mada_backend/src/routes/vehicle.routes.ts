import { Router } from 'express';
import * as vehicleController from '../controllers/vehicle.controller';
import { authenticateJWT } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles('DRIVER'), vehicleController.addVehicle);
router.get('/my-vehicles', authenticateJWT, authorizeRoles('DRIVER'), vehicleController.getMyVehicles);
router.put('/:id', authenticateJWT, authorizeRoles('DRIVER'), vehicleController.updateVehicle);
router.delete('/:id', authenticateJWT, authorizeRoles('DRIVER'), vehicleController.deleteVehicle);

export default router;