"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isDriver = exports.authorizeRoles = void 0;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Utilisateur non authentifié" });
        }
        if (!req.user.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Accès refusé. Rôle requis : ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// Middleware spécifique Conducteur
exports.isDriver = (0, exports.authorizeRoles)('DRIVER');
// Middleware Admin
exports.isAdmin = (0, exports.authorizeRoles)('ADMIN');
//# sourceMappingURL=role.js.map