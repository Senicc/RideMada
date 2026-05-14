"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getChatHistory = void 0;
const db_1 = __importDefault(require("../config/db"));
const getChatHistory = async (req, res) => {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const peerId = typeof req.params.userId === 'string' ? req.params.userId : req.params.userId?.[0];
    if (!peerId) {
        return res.status(400).json({ success: false, message: 'userId requis' });
    }
    const messages = await db_1.default.message.findMany({
        where: {
            OR: [
                { senderId: currentUserId, receiverId: peerId },
                { senderId: peerId, receiverId: currentUserId },
            ],
        },
        include: { sender: { select: { name: true, photo: true } } },
        orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, messages });
};
exports.getChatHistory = getChatHistory;
const sendMessage = async (req, res) => {
    const senderId = req.user?.id;
    if (!senderId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const { receiverId, content, rideId } = req.body;
    const message = await db_1.default.message.create({
        data: { senderId, receiverId, content, rideId },
        include: { sender: true },
    });
    res.status(201).json({ success: true, message });
};
exports.sendMessage = sendMessage;
//# sourceMappingURL=message.controller.js.map