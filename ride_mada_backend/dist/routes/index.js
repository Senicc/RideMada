"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const driver_routes_1 = __importDefault(require("./driver.routes"));
const vehicle_routes_1 = __importDefault(require("./vehicle.routes"));
const ride_routes_1 = __importDefault(require("./ride.routes"));
const booking_routes_1 = __importDefault(require("./booking.routes"));
const message_routes_1 = __importDefault(require("./message.routes"));
const payment_routes_1 = __importDefault(require("./payment.routes"));
const review_routes_1 = __importDefault(require("./review.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/drivers', driver_routes_1.default);
router.use('/vehicles', vehicle_routes_1.default);
router.use('/rides', ride_routes_1.default);
router.use('/bookings', booking_routes_1.default);
router.use('/messages', message_routes_1.default);
router.use('/payments', payment_routes_1.default);
router.use('/reviews', review_routes_1.default);
router.use('/admin', admin_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map