"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateSocket = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Accès non autorisé - Token manquant" });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token manquant' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ success: false, message: 'JWT_SECRET non configuré' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expiré" });
        }
        return res.status(403).json({ success: false, message: "Token invalide" });
    }
};
exports.authenticateJWT = authenticateJWT;
// Optionnel : Authentification Socket.IO
const authenticateSocket = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token)
        return next(new Error("Authentication error"));
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret)
            return next(new Error('JWT_SECRET non configuré'));
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        socket.user = decoded;
        next();
    }
    catch (err) {
        next(new Error("Invalid token"));
    }
};
exports.authenticateSocket = authenticateSocket;
//# sourceMappingURL=auth.js.map