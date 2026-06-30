"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityHeaders = exports.antiFakeGPS = void 0;
// Détection simple de Fake GPS (basé sur en-têtes ou vitesse future)
const antiFakeGPS = (req, res, next) => {
    // En production, combiner avec vérification de vitesse + historique de positions
    const { speed, accuracy } = req.body;
    if (accuracy && accuracy > 100) { // Précision > 100m = suspect
        console.warn(`[ANTI-FAKE-GPS] Position suspecte de l'utilisateur ${req.user?.id}`);
        // Vous pouvez logger ou bloquer temporairement
    }
    next();
};
exports.antiFakeGPS = antiFakeGPS;
// Protection générale
const securityHeaders = (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
};
exports.securityHeaders = securityHeaders;
//# sourceMappingURL=security.js.map