"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const db_1 = __importDefault(require("../config/db"));
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(require('../config/firebase-service-account.json'))
    });
}
class NotificationService {
    static async sendPushNotification(userId, title, body, data = {}) {
        try {
            const user = await db_1.default.user.findUnique({
                where: { id: userId },
                select: { fcmToken: true }
            });
            if (!user?.fcmToken)
                return;
            const message = {
                token: user.fcmToken,
                notification: { title, body },
                data: { ...data, click_action: "FLUTTER_NOTIFICATION_CLICK" },
                android: { priority: 'high' },
                apns: { headers: { 'apns-priority': '10' } }
            };
            await firebase_admin_1.default.messaging().send(message);
        }
        catch (error) {
            console.error('FCM Error:', error);
        }
    }
    // Notifications spécifiques RideMada
    static async notifyNewBooking(rideId, passengerName) {
        const ride = await db_1.default.ride.findUnique({
            where: { id: rideId },
            include: { driver: { include: { user: true } } }
        });
        if (ride?.driver?.user) {
            await this.sendPushNotification(ride.driver.user.id, "Nouvelle réservation !", `${passengerName} a réservé ${ride.availableSeats} place(s)`, { type: "NEW_BOOKING", rideId });
        }
    }
    static async notifyDriverArrived(rideId) {
        // Notifier tous les passagers du trajet
    }
}
exports.NotificationService = NotificationService;
exports.default = NotificationService;
//# sourceMappingURL=notification.service.js.map