"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const db_1 = __importDefault(require("../config/db"));
const firebase_1 = __importDefault(require("../config/firebase"));
class NotificationService {
    static async createInAppNotification(userId, title, body, type = 'INFO') {
        return db_1.default.notification.create({
            data: { userId, title, body, type },
        });
    }
    static async sendPushNotification(userId, title, body, data = {}) {
        try {
            const user = await db_1.default.user.findUnique({
                where: { id: userId },
                select: { fcmToken: true },
            });
            if (!user?.fcmToken)
                return;
            await firebase_1.default.messaging().send({
                token: user.fcmToken,
                notification: { title, body },
                data: { ...data, type: data.type ?? 'INFO' },
                android: { priority: 'high' },
            });
        }
        catch (error) {
            console.error('[FCM]', error);
        }
    }
    static async notifyNewBooking(rideId, passengerName, seats) {
        const ride = await db_1.default.ride.findUnique({
            where: { id: rideId },
            include: { driver: { include: { user: true } } },
        });
        if (!ride?.driver?.user)
            return;
        const title = 'Nouvelle réservation';
        const body = `${passengerName} a réservé ${seats} place(s)`;
        await this.createInAppNotification(ride.driver.user.id, title, body, 'RIDE_UPDATE');
        await this.sendPushNotification(ride.driver.user.id, title, body, {
            type: 'NEW_BOOKING',
            rideId,
        });
    }
}
exports.NotificationService = NotificationService;
exports.default = NotificationService;
//# sourceMappingURL=notification.service.js.map