"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureActiveUser = void 0;
const db_1 = __importDefault(require("../config/db"));
/** Vérifie que l'utilisateur JWT n'est pas bloqué. */
const ensureActiveUser = async (req, res, next) => {
    if (!req.user?.id) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    try {
        const user = await db_1.default.user.findUnique({
            where: { id: req.user.id },
            select: { isBlocked: true },
        });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
        }
        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Compte suspendu' });
        }
        next();
    }
    catch {
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.ensureActiveUser = ensureActiveUser;
//# sourceMappingURL=ensureActiveUser.js.map