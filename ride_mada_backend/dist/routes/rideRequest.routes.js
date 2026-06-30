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
const rideRequestController = __importStar(require("../controllers/rideRequest.controller"));
const auth_1 = require("../middlewares/auth");
const ensureActiveUser_1 = require("../middlewares/ensureActiveUser");
const role_1 = require("../middlewares/role");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT, ensureActiveUser_1.ensureActiveUser);
router.post('/', rideRequestController.createRideRequest);
router.get('/my', rideRequestController.getMyRideRequests);
router.get('/pending', (0, role_1.authorizeRoles)('DRIVER'), rideRequestController.getPendingForDriver);
router.get('/driver/active', (0, role_1.authorizeRoles)('DRIVER'), rideRequestController.getDriverActiveRide);
router.get('/driver/history', (0, role_1.authorizeRoles)('DRIVER'), rideRequestController.getDriverRideHistory);
router.get('/:id', rideRequestController.getRideRequestById);
router.put('/:id/accept', (0, role_1.authorizeRoles)('DRIVER'), rideRequestController.acceptRideRequest);
router.put('/:id/reject', (0, role_1.authorizeRoles)('DRIVER'), rideRequestController.rejectRideRequest);
router.put('/:id/arriving', (0, role_1.authorizeRoles)('DRIVER'), rideRequestController.driverArriving);
router.put('/:id/start', (0, role_1.authorizeRoles)('DRIVER'), rideRequestController.startRideRequest);
router.put('/:id/complete', (0, role_1.authorizeRoles)('DRIVER'), rideRequestController.completeRideRequest);
router.put('/:id/cancel', rideRequestController.cancelRideRequest);
exports.default = router;
//# sourceMappingURL=rideRequest.routes.js.map