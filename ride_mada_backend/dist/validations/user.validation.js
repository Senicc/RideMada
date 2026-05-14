"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileValidation = void 0;
const express_validator_1 = require("express-validator");
exports.updateProfileValidation = [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2 }),
    (0, express_validator_1.body)('email').optional().isEmail(),
];
//# sourceMappingURL=user.validation.js.map