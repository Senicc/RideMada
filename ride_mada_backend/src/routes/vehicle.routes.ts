import { Router } from 'express';
import * as vehicleController from '../controllers/vehicle.controller';
import { authenticateJWT } from '../middlewares/auth';
import { ensureActiveUser } from '../middlewares/ensureActiveUser';

const router = Router();

router.use(authenticateJWT, ensureActiveUser);

router.post('/', vehicleController.addVehicle);
router.get('/my-vehicles', vehicleController.getMyVehicles);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

export default router;
