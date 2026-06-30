"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicUserSelect = void 0;
exports.stripSensitiveUser = stripSensitiveUser;
/** Champs utilisateur sûrs pour les réponses API (sans secrets). */
exports.publicUserSelect = {
    id: true,
    name: true,
    phone: true,
    email: true,
    photo: true,
    role: true,
    isVerified: true,
    rating: true,
    createdAt: true,
};
function stripSensitiveUser(user) {
    const { password, otpCode, otpExpires, fcmToken, ...safe } = user;
    return safe;
}
//# sourceMappingURL=userPublic.js.map