import { Router } from 'express';
import * as mapController from '../controllers/map.controller';

const router = Router();

router.get('/geocode', mapController.geocode);
router.get('/reverse', mapController.reverse);
router.get('/autocomplete', mapController.autocomplete);
router.get('/directions', mapController.directions);

export default router;
