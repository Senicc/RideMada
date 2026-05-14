"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoordinates = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Erreur de validation",
            errors: errors.array()
        });
    }
    next();
};
exports.validate = validate;
// Validation personnalisée GPS
const validateCoordinates = (req, res, next) => {
    const { departureLat, departureLng, arrivalLat, arrivalLng } = req.body;
    const isValidLat = (lat) => lat >= -90 && lat <= 90;
    const isValidLng = (lng) => lng >= -180 && lng <= 180;
    if (!isValidLat(departureLat) || !isValidLng(departureLng) ||
        !isValidLat(arrivalLat) || !isValidLng(arrivalLng)) {
        return res.status(400).json({ success: false, message: "Coordonnées GPS invalides" });
    }
    next();
};
exports.validateCoordinates = validateCoordinates;
//# sourceMappingURL=validation.js.map