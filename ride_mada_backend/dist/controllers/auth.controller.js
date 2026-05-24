"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.forgotPassword = exports.verifyOTP = exports.refreshToken = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const otp_1 = require("../utils/otp");
const sms_service_1 = require("../services/sms.service");
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';
function signAccessToken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: ACCESS_EXPIRES,
    });
}
function signRefreshToken(userId) {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRES,
    });
}
function formatUser(user) {
    return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email ?? null,
        role: user.role,
        photo: user.photo,
        rating: user.rating,
        isVerified: user.isVerified,
    };
}
const register = async (req, res) => {
    try {
        const { phone, name, password, email, role = 'PASSENGER' } = req.body;
        const existingUser = await db_1.default.user.findUnique({ where: { phone } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Ce numéro est déjà utilisé' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const otp = (0, otp_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        const user = await db_1.default.user.create({
            data: {
                phone,
                name,
                email: email || null,
                password: hashedPassword,
                role,
                otpCode: otp,
                otpExpires,
            },
        });
        await (0, sms_service_1.sendOTPSMS)(phone, otp);
        const isDev = process.env.NODE_ENV !== 'production';
        res.status(201).json({
            success: true,
            message: 'Compte créé. Vérifiez le code OTP envoyé par SMS.',
            userId: user.id,
            ...(isDev ? { tempOTP: otp } : {}),
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        res.status(500).json({ success: false, message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        const user = await db_1.default.user.findUnique({
            where: { phone },
            include: { driver: true },
        });
        if (!user?.password || !(await bcrypt_1.default.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Numéro ou mot de passe incorrect' });
        }
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Compte non vérifié. Saisissez le code OTP.',
                requiresVerification: true,
                userId: user.id,
            });
        }
        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user.id);
        res.json({
            success: true,
            accessToken,
            refreshToken,
            user: formatUser(user),
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        res.status(500).json({ success: false, message });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Refresh token requis' });
        }
        const secret = process.env.JWT_REFRESH_SECRET;
        if (!secret) {
            return res.status(500).json({ success: false, message: 'JWT_REFRESH_SECRET non configuré' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await db_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
        }
        res.json({
            success: true,
            accessToken: signAccessToken(user),
            refreshToken: signRefreshToken(user.id),
        });
    }
    catch {
        res.status(401).json({ success: false, message: 'Refresh token invalide ou expiré' });
    }
};
exports.refreshToken = refreshToken;
const verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const user = await db_1.default.user.findUnique({ where: { phone } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        }
        if (user.otpCode !== otp ||
            !user.otpExpires ||
            user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'Code OTP invalide ou expiré' });
        }
        const updated = await db_1.default.user.update({
            where: { id: user.id },
            data: { isVerified: true, otpCode: null, otpExpires: null },
        });
        const accessToken = signAccessToken(updated);
        const refreshToken = signRefreshToken(updated.id);
        res.json({
            success: true,
            message: 'Compte vérifié',
            accessToken,
            refreshToken,
            user: formatUser(updated),
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        res.status(500).json({ success: false, message });
    }
};
exports.verifyOTP = verifyOTP;
const forgotPassword = async (req, res) => {
    try {
        const { phone } = req.body;
        const user = await db_1.default.user.findUnique({ where: { phone } });
        if (!user) {
            return res.json({
                success: true,
                message: 'Si ce numéro existe, un code de réinitialisation a été envoyé.',
            });
        }
        const otp = (0, otp_1.generateOTP)();
        await db_1.default.user.update({
            where: { id: user.id },
            data: {
                otpCode: otp,
                otpExpires: new Date(Date.now() + 10 * 60 * 1000),
            },
        });
        await (0, sms_service_1.sendOTPSMS)(phone, otp);
        const isDev = process.env.NODE_ENV !== 'production';
        res.json({
            success: true,
            message: 'Code de réinitialisation envoyé par SMS.',
            ...(isDev ? { tempOTP: otp } : {}),
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        res.status(500).json({ success: false, message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { phone, otp, newPassword } = req.body;
        const user = await db_1.default.user.findUnique({ where: { phone } });
        if (!user ||
            user.otpCode !== otp ||
            !user.otpExpires ||
            user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'Code invalide ou expiré' });
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await db_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                otpCode: null,
                otpExpires: null,
                isVerified: true,
            },
        });
        res.json({ success: true, message: 'Mot de passe mis à jour' });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        res.status(500).json({ success: false, message });
    }
};
exports.resetPassword = resetPassword;
const logout = async (_req, res) => {
    res.json({ success: true, message: 'Déconnexion réussie' });
};
exports.logout = logout;
//# sourceMappingURL=auth.controller.js.map