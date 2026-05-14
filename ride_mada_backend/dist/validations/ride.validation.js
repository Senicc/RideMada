"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRideValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createRideValidation = [
    (0, express_validator_1.body)('departureLat').isFloat({ min: -90, max: 90 }),
    (0, express_validator_1.body)('departureLng').isFloat({ min: -180, max: 180 }),
    (0, express_validator_1.body)('arrivalLat').isFloat({ min: -90, max: 90 }),
    (0, express_validator_1.body)('arrivalLng').isFloat({ min: -180, max: 180 }),
    (0, express_validator_1.body)('price').isFloat({ min: 500 }),
    (0, express_validator_1.body)('availableSeats').isInt({ min: 1, max: 8 }),
    (0, express_validator_1.body)('departureTime').isISO8601(),
];
//# sourceMappingURL=ride.validation.js.map