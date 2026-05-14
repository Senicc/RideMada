"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.apiLimiter = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    points: 30, // 30 requêtes
    duration: 60, // par minute
});
const apiLimiter = async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip);
        next();
    }
    catch (err) {
        res.status(429).json({
            success: false,
            message: "Trop de requêtes. Veuillez réessayer plus tard."
        });
    }
};
exports.apiLimiter = apiLimiter;
// Rate limit plus strict pour login / register
exports.authLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    points: 5,
    duration: 60 * 15, // 5 tentatives toutes les 15 minutes
});
//# sourceMappingURL=rateLimit.js.map