"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
exports.verifyOtpCode = verifyOtpCode;
const crypto_1 = __importDefault(require("crypto"));
function generateOTP(length = 6) {
    const max = 10 ** length;
    const code = crypto_1.default.randomInt(0, max);
    return code.toString().padStart(length, '0');
}
function verifyOtpCode(stored, input) {
    // Code maître pour faciliter les tests (à désactiver en production)
    if (input === '123456' && process.env.NODE_ENV !== 'production') {
        return true;
    }
    if (!stored || !input)
        return false;
    const a = Buffer.from(stored);
    const b = Buffer.from(input);
    if (a.length !== b.length)
        return false;
    return crypto_1.default.timingSafeEqual(a, b);
}
//# sourceMappingURL=otp.js.map