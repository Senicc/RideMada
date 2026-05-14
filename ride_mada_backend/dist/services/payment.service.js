"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const db_1 = __importDefault(require("../config/db"));
const notification_service_1 = __importDefault(require("./notification.service"));
class PaymentService {
    static async confirmCashPayment(bookingId, driverId) {
        const payment = await db_1.default.payment.create({
            data: {
                bookingId,
                userId: driverId,
                amount: 0, // À calculer
                method: 'CASH',
                status: 'COMPLETED'
            }
        });
        await notification_service_1.default.sendPushNotification(driverId, "Paiement confirmé", "Le passager a confirmé le paiement en espèces.");
        return payment;
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map