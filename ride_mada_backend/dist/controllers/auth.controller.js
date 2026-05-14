"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.forgotPassword = exports.verifyOTP = exports.refreshToken = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const otp_1 = require("../utils/otp");
const sms_service_1 = require("../services/sms.service"); // À implémenter avec MVola/Orange
const register = async (req, res) => {
    try {
        const { phone, name, password, email, role = 'PASSENGER' } = req.body;
        const existingUser = await db_1.default.user.findUnique({ where: { phone } });
        if (existingUser)
            return res.status(409).json({ message: "Ce numéro est déjà utilisé" });
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const otp = (0, otp_1.generateOTP)();
        const user = await db_1.default.user.create({
            data: {
                phone,
                name,
                email,
                password: hashedPassword,
                role,
            }
        });
        // Envoi OTP (simulation en dev)
        await (0, sms_service_1.sendOTPSMS)(phone, otp);
        res.status(201).json({
            success: true,
            message: "Compte créé avec succès",
            userId: user.id,
            tempOTP: otp // Retirer en production
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        const user = await db_1.default.user.findUnique({
            where: { phone },
            include: { driver: true }
        });
        if (!user || !user.password || !(await bcrypt_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: "Numéro ou mot de passe incorrect" });
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        res.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                photo: user.photo,
                rating: user.rating,
                isVerified: user.isVerified
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    // Implémentation refresh token
};
exports.refreshToken = refreshToken;
const verifyOTP = async (req, res) => { };
exports.verifyOTP = verifyOTP;
const forgotPassword = async (req, res) => { };
exports.forgotPassword = forgotPassword;
const logout = async (_req, res) => {
    res.json({ success: true, message: 'Déconnexion (côté client : supprimer les tokens)' });
};
exports.logout = logout;
//# sourceMappingURL=auth.controller.js.map