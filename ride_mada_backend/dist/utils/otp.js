"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReferralCode = exports.generateOTP = void 0;
const generateOTP = (length = 6) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
};
exports.generateOTP = generateOTP;
const generateReferralCode = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};
exports.generateReferralCode = generateReferralCode;
//# sourceMappingURL=otp.js.map