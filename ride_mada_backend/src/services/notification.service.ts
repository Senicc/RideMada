import type { Response } from 'express';
import type { AuthRequest } from '../types/authRequest';
import prisma from '../config/db';
import admin from '../config/firebase';

export class NotificationService {
  static async createInAppNotification(
    userId: string,
    title: string,
    body: string,
    type: string = 'INFO',
  ) {
    return prisma.notification.create({
      data: { userId, title, body, type },
    });
  }

  static async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data: Record<string, string> = {},
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true },
      });
      if (!user?.fcmToken) return;

      await admin.messaging().send({
        token: user.fcmToken,
        notification: { title, body },
        data: { ...data, type: data.type ?? 'INFO' },
        android: { priority: 'high' },
      });
    } catch (error) {
      console.error('[FCM]', error);
    }
  }

  static async notifyNewBooking(rideId: string, passengerName: string, seats: number) {
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { driver: { include: { user: true } } },
    });
    if (!ride?.driver?.user) return;

    const title = 'Nouvelle réservation';
    const body = `${passengerName} a réservé ${seats} place(s)`;
    await this.createInAppNotification(ride.driver.user.id, title, body, 'RIDE_UPDATE');
    await this.sendPushNotification(ride.driver.user.id, title, body, {
      type: 'NEW_BOOKING',
      rideId,
    });
  }
}

export default NotificationService;
