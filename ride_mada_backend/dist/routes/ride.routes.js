"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const rideController = __importStar(require("../controllers/ride.controller"));
const auth_1 = require("../middlewares/auth");
const ensureActiveUser_1 = require("../middlewares/ensureActiveUser");
const role_1 = require("../middlewares/role");
const validation_1 = require("../middlewares/validation");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateJWT, ensureActiveUser_1.ensureActiveUser, (0, role_1.authorizeRoles)('DRIVER'), [
    (0, express_validator_1.body)('departureLat').isFloat(),
    (0, express_validator_1.body)('departureLng').isFloat(),
    (0, express_validator_1.body)('arrivalLat').isFloat(),
    (0, express_validator_1.body)('arrivalLng').isFloat(),
    (0, express_validator_1.body)('departureAddress').notEmpty(),
    (0, express_validator_1.body)('arrivalAddress').notEmpty(),
    (0, express_validator_1.body)('departureTime').notEmpty(),
    (0, express_validator_1.body)('vehicleId').isUUID(),
    (0, express_validator_1.body)('price').isFloat({ min: 1000 }),
    (0, express_validator_1.body)('availableSeats').isInt({ min: 1 }),
], validation_1.validate, rideController.createRide);
router.get('/nearby', [
    (0, express_validator_1.query)('lat').isFloat(),
    (0, express_validator_1.query)('lng').isFloat(),
], validation_1.validate, rideController.getNearbyRides);
router.get('/estimate-fare', [
    (0, express_validator_1.query)('departureLat').isFloat(),
    (0, express_validator_1.query)('departureLng').isFloat(),
    (0, express_validator_1.query)('arrivalLat').isFloat(),
    (0, express_validator_1.query)('arrivalLng').isFloat(),
    (0, express_validator_1.query)('vehicleType').optional().isIn(['SEDAN', 'SUV', 'MINIBUS', 'MOTORCYCLE']),
], validation_1.validate, rideController.estimateFare);
router.get('/nearby-drivers', auth_1.authenticateJWT, ensureActiveUser_1.ensureActiveUser, [
    (0, express_validator_1.query)('lat').optional().isFloat(),
    (0, express_validator_1.query)('lng').optional().isFloat(),
], validation_1.validate, rideController.findNearbyDrivers);
router.get('/:id', rideController.getRideById);
router.put('/:id', auth_1.authenticateJWT, ensureActiveUser_1.ensureActiveUser, (0, role_1.authorizeRoles)('DRIVER'), rideController.updateRide);
router.delete('/:id', auth_1.authenticateJWT, ensureActiveUser_1.ensureActiveUser, (0, role_1.authorizeRoles)('DRIVER'), rideController.cancelRide);
router.get('/', rideController.getAllRides);
exports.default = router;
//# sourceMappingURL=ride.routes.js.map