"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentHistory = exports.confirmCashPayment = exports.initiatePayment = void 0;
const db_1 = __importDefault(require("../config/db"));
const payment_service_1 = require("../services/payment.service");
const initiatePayment = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const { bookingId, method } = req.body;
    const payment = await db_1.default.payment.create({
        data: {
            bookingId,
            userId,
            amount: 0,
            method,
            status: method === 'CASH' ? 'PENDING' : 'PROCESSING',
        },
    });
    res.status(201).json({ success: true, payment });
};
exports.initiatePayment = initiatePayment;
const confirmCashPayment = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const { bookingId } = req.body;
    const result = await payment_service_1.PaymentService.confirmCashPayment(bookingId, userId);
    res.json({ success: true, payment: result });
};
exports.confirmCashPayment = confirmCashPayment;
const getPaymentHistory = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    const payments = await db_1.default.payment.findMany({
        where: { userId },
        include: { booking: { include: { ride: true } } },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, payments });
};
exports.getPaymentHistory = getPaymentHistory;
//# sourceMappingURL=payment.controller.js.map