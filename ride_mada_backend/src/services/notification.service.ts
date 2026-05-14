import admin from 'firebase-admin';
import prisma from '../config/db';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../config/firebase-service-account.json'))
  });
}

export class NotificationService {

  static async sendPushNotification(userId: string, title: string, body: string, data: any = {}) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true }
      });

      if (!user?.fcmToken) return;

      const message = {
        token: user.fcmToken,
        notification: { title, body },
        data: { ...data, click_action: "FLUTTER_NOTIFICATION_CLICK" },
        android: { priority: 'high' as const },
        apns: { headers: { 'apns-priority': '10' } }
      };

      await admin.messaging().send(message);
    } catch (error) {
      console.error('FCM Error:', error);
    }
  }

  // Notifications spécifiques RideMada
  static async notifyNewBooking(rideId: string, passengerName: string) {
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { driver: { include: { user: true } } }
    });

    if (ride?.driver?.user) {
      await this.sendPushNotification(
        ride.driver.user.id,
        "Nouvelle réservation !",
        `${passengerName} a réservé ${ride.availableSeats} place(s)`,
        { type: "NEW_BOOKING", rideId }
      );
    }
  }

  static async notifyDriverArrived(rideId: string) {
    // Notifier tous les passagers du trajet
  }
}

export default NotificationService;