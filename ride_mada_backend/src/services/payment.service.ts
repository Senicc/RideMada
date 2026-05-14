import prisma from '../config/db';
import NotificationService from './notification.service';

export class PaymentService {

  static async confirmCashPayment(bookingId: string, driverId: string) {
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId: driverId,
        amount: 0, // À calculer
        method: 'CASH',
        status: 'COMPLETED'
      }
    });

    await NotificationService.sendPushNotification(
      driverId,
      "Paiement confirmé",
      "Le passager a confirmé le paiement en espèces."
    );

    return payment;
  }
}