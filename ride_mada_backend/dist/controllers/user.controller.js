"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateFcmToken = exports.deleteFavorite = exports.addFavorite = exports.getFavorites = exports.getActivityHistory = exports.updateProfile = exports.getProfile = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../config/db"));
const cloudinary_1 = require("../utils/cloudinary");
const userPublic_1 = require("../utils/userPublic");
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
            select: {
                ...userPublic_1.publicUserSelect,
                driver: { select: { id: true, status: true, isApproved: true, rating: true } },
            },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        }
        res.json({ success: true, user });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        res.status(500).json({ success: false, message });
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
            select: userPublic_1.publicUserSelect,
        });
        res.json({ success: true, user });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        res.status(500).json({ success: false, message });
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
const addFavorite = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const { type, targetId, label, address, lat, lng } = req.body;
    if (!type) {
        return res.status(400).json({ success: false, message: 'type requis' });
    }
    const favorite = await db_1.default.favorite.upsert({
        where: {
            userId_type_targetId: {
                userId,
                type,
                targetId: targetId ?? `${type}_${userId}`,
            },
        },
        create: {
            userId,
            type,
            targetId: targetId ?? `${type}_${userId}`,
            label,
            address,
            lat,
            lng,
        },
        update: { label, address, lat, lng },
    });
    res.status(201).json({ success: true, favorite });
};
exports.addFavorite = addFavorite;
const deleteFavorite = async (req, res) => {
    const userId = req.user?.id;
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!userId || !id) {
        return res.status(400).json({ success: false, message: 'Requête invalide' });
    }
    const deleted = await db_1.default.favorite.deleteMany({ where: { id, userId } });
    if (deleted.count === 0) {
        return res.status(404).json({ success: false, message: 'Favori introuvable' });
    }
    res.json({ success: true, message: 'Favori supprimé' });
};
exports.deleteFavorite = deleteFavorite;
const updateFcmToken = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }
        const { fcmToken } = req.body;
        if (!fcmToken || typeof fcmToken !== 'string') {
            return res.status(400).json({ success: false, message: 'fcmToken requis' });
        }
        await db_1.default.user.update({
            where: { id: userId },
            data: { fcmToken },
        });
        res.json({ success: true, message: 'Token FCM enregistré' });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        res.status(500).json({ success: false, message });
    }
};
exports.updateFcmToken = updateFcmToken;
const changePassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword || String(newPassword).length < 6) {
            return res.status(400).json({ success: false, message: 'Mot de passe actuel et nouveau (6+ car.) requis' });
        }
        const user = await db_1.default.user.findUnique({ where: { id: userId } });
        if (!user?.password || !(await bcrypt_1.default.compare(currentPassword, user.password))) {
            return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' });
        }
        const hashed = await bcrypt_1.default.hash(newPassword, 10);
        await db_1.default.user.update({ where: { id: userId }, data: { password: hashed } });
        res.json({ success: true, message: 'Mot de passe mis à jour' });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        res.status(500).json({ success: false, message });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=user.controller.js.map