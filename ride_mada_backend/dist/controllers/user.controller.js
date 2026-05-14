"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = exports.getActivityHistory = exports.updateProfile = exports.getProfile = void 0;
const db_1 = __importDefault(require("../config/db"));
const cloudinary_1 = require("../utils/cloudinary");
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
            include: { driver: true },
        });
        res.json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }
        const { name, email } = req.body;
        let photoUrl = undefined;
        if (req.file) {
            const uploaded = await (0, cloudinary_1.uploadToCloudinary)(req.file);
            photoUrl = uploaded.secure_url;
        }
        const user = await db_1.default.user.update({
            where: { id: userId },
            data: { name, email, ...(photoUrl && { photo: photoUrl }) },
        });
        res.json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProfile = updateProfile;
const getActivityHistory = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const bookings = await db_1.default.booking.findMany({
        where: { passengerId: userId },
        include: { ride: { include: { driver: { include: { user: true } } } } },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, bookings });
};
exports.getActivityHistory = getActivityHistory;
const getFavorites = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const favorites = await db_1.default.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, favorites });
};
exports.getFavorites = getFavorites;
//# sourceMappingURL=user.controller.js.map