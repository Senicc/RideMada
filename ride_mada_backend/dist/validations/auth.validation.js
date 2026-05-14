"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidation = [
    (0, express_validator_1.body)('phone').isMobilePhone('any'),
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('email').optional().isEmail(),
];
exports.loginValidation = [
    (0, express_validator_1.body)('phone').notEmpty(),
    (0, express_validator_1.body)('password').notEmpty(),
];
//# sourceMappingURL=auth.validation.js.map