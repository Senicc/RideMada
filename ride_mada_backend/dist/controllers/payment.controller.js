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
    const { bookingId, rideRequestId, method } = req.body;
    if (rideRequestId) {
        const rideRequest = await db_1.default.rideRequest.findUnique({ where: { id: rideRequestId } });
        if (!rideRequest || rideRequest.passengerId !== userId) {
            return res.status(403).json({ success: false, message: 'Course introuvable' });
        }
        const existing = await db_1.default.payment.findFirst({
            where: { rideRequestId, status: { in: ['PENDING', 'COMPLETED', 'PROCESSING'] } },
        });
        if (existing) {
            return res.json({ success: true, payment: { ...existing, amount: Number(existing.amount) } });
        }
        const amount = Number(rideRequest.finalPrice ?? rideRequest.estimatedPrice);
        const payment = await db_1.default.payment.create({
            data: {
                rideRequestId,
                userId,
                amount,
                method: method ?? 'CASH',
                status: method === 'CASH' ? 'PENDING' : 'PROCESSING',
            },
        });
        return res.status(201).json({ success: true, payment: { ...payment, amount: Number(payment.amount) } });
    }
    const booking = await db_1.default.booking.findUnique({
        where: { id: bookingId },
        include: { ride: true },
    });
    if (!booking || booking.passengerId !== userId) {
        return res.status(403).json({ success: false, message: 'Réservation introuvable' });
    }
    const existing = await db_1.default.payment.findFirst({
        where: { bookingId, status: { in: ['PENDING', 'COMPLETED', 'PROCESSING'] } },
    });
    if (existing) {
        return res.json({ success: true, payment: { ...existing, amount: Number(existing.amount) } });
    }
    const amount = Number(booking.ride.price) * booking.seats;
    const payment = await db_1.default.payment.create({
        data: {
            bookingId,
            userId,
            amount,
            method: method ?? 'CASH',
            status: method === 'CASH' ? 'PENDING' : 'PROCESSING',
        },
    });
    res.status(201).json({ success: true, payment: { ...payment, amount: Number(payment.amount) } });
};
exports.initiatePayment = initiatePayment;
const confirmCashPayment = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    try {
        const { bookingId, rideRequestId } = req.body;
        if (rideRequestId) {
            const result = await payment_service_1.PaymentService.confirmCashPaymentForRideRequest(rideRequestId, userId);
            return res.json({ success: true, payment: { ...result, amount: Number(result.amount) } });
        }
        const result = await payment_service_1.PaymentService.confirmCashPayment(bookingId, userId);
        res.json({ success: true, payment: { ...result, amount: Number(result.amount) } });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur paiement';
        res.status(400).json({ success: false, message });
    }
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
    res.json({
        success: true,
        payments: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
    });
};
exports.getPaymentHistory = getPaymentHistory;
//# sourceMappingURL=payment.controller.js.map