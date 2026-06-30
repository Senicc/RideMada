"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const db_1 = __importDefault(require("../config/db"));
class PaymentService {
    static async confirmCashPayment(bookingId, userId) {
        const booking = await db_1.default.booking.findUnique({
            where: { id: bookingId },
            include: { ride: { include: { driver: true } }, payments: true },
        });
        if (!booking) {
            throw new Error('Réservation introuvable');
        }
        const isDriver = booking.ride.driver.userId === userId;
        const isPassenger = booking.passengerId === userId;
        if (!isDriver && !isPassenger) {
            throw new Error('Accès refusé');
        }
        const existing = booking.payments.find((p) => ['COMPLETED', 'PENDING', 'PROCESSING'].includes(p.status));
        if (existing?.status === 'COMPLETED') {
            return existing;
        }
        if (existing) {
            return db_1.default.payment.update({
                where: { id: existing.id },
                data: { status: 'COMPLETED' },
            });
        }
        const amount = Number(booking.ride.price) * booking.seats;
        return db_1.default.payment.create({
            data: {
                bookingId,
                userId: booking.passengerId,
                amount,
                method: 'CASH',
                status: 'COMPLETED',
            },
        });
    }
    static async confirmCashPaymentForRideRequest(rideRequestId, userId) {
        const rideRequest = await db_1.default.rideRequest.findUnique({
            where: { id: rideRequestId },
            include: { driver: true, payments: true },
        });
        if (!rideRequest) {
            throw new Error('Course introuvable');
        }
        const isPassenger = rideRequest.passengerId === userId;
        const isDriver = rideRequest.driver?.userId === userId;
        if (!isPassenger && !isDriver) {
            throw new Error('Accès refusé');
        }
        const existing = rideRequest.payments.find((p) => ['COMPLETED', 'PENDING', 'PROCESSING'].includes(p.status));
        if (existing?.status === 'COMPLETED') {
            return existing;
        }
        if (existing) {
            return db_1.default.payment.update({
                where: { id: existing.id },
                data: { status: 'COMPLETED' },
            });
        }
        const amount = Number(rideRequest.finalPrice ?? rideRequest.estimatedPrice);
        return db_1.default.payment.create({
            data: {
                rideRequestId,
                userId: rideRequest.passengerId,
                amount,
                method: 'CASH',
                status: 'COMPLETED',
            },
        });
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map