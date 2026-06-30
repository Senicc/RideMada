"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const db_1 = __importDefault(require("../config/db"));
const getNotifications = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const notifications = await db_1.default.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    res.json({ success: true, notifications });
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    const userId = req.user?.id;
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!userId || !id) {
        return res.status(400).json({ success: false, message: 'Requête invalide' });
    }
    const notification = await db_1.default.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
    });
    if (notification.count === 0) {
        return res.status(404).json({ success: false, message: 'Notification introuvable' });
    }
    res.json({ success: true, message: 'Notification lue' });
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    await db_1.default.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
    res.json({ success: true, message: 'Toutes les notifications sont lues' });
};
exports.markAllAsRead = markAllAsRead;
const getUnreadCount = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const count = await db_1.default.notification.count({ where: { userId, isRead: false } });
    res.json({ success: true, count });
};
exports.getUnreadCount = getUnreadCount;
//# sourceMappingURL=notification.controller.js.map