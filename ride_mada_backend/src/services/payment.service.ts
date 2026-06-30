import prisma from '../config/db';
import {
  initiateMobileMoneyPayment,
  verifyMobileMoneyWebhook,
  type MobileMoneyProvider,
} from './mobileMoney.service';

export class PaymentService {
  static async confirmCashPayment(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { ride: { include: { driver: true } }, payments: true },
    });

    if (!booking) throw new Error('Réservation introuvable');

    const isDriver = booking.ride.driver.userId === userId;
    const isPassenger = booking.passengerId === userId;
    if (!isDriver && !isPassenger) throw new Error('Accès refusé');

    const existing = booking.payments.find((p) =>
      ['COMPLETED', 'PENDING', 'PROCESSING'].includes(p.status),
    );
    if (existing?.status === 'COMPLETED') return existing;
    if (existing) {
      return prisma.payment.update({ where: { id: existing.id }, data: { status: 'COMPLETED' } });
    }

    const amount = Number(booking.ride.price) * booking.seats;
    return prisma.payment.create({
      data: { bookingId, userId: booking.passengerId, amount, method: 'CASH', status: 'COMPLETED' },
    });
  }

  static async confirmCashPaymentForRideRequest(rideRequestId: string, userId: string) {
    const rideRequest = await prisma.rideRequest.findUnique({
      where: { id: rideRequestId },
      include: { driver: true, payments: true },
    });

    if (!rideRequest) throw new Error('Course introuvable');

    const isPassenger = rideRequest.passengerId === userId;
    const isDriver = rideRequest.driver?.userId === userId;
    if (!isPassenger && !isDriver) throw new Error('Accès refusé');

    const existing = rideRequest.payments.find((p) =>
      ['COMPLETED', 'PENDING', 'PROCESSING'].includes(p.status),
    );
    if (existing?.status === 'COMPLETED') return existing;
    if (existing) {
      return prisma.payment.update({ where: { id: existing.id }, data: { status: 'COMPLETED' } });
    }

    const amount = Number(rideRequest.finalPrice ?? rideRequest.estimatedPrice);
    return prisma.payment.create({
      data: { rideRequestId, userId: rideRequest.passengerId, amount, method: 'CASH', status: 'COMPLETED' },
    });
  }

  static async processMobileMoney(
    paymentId: string,
    provider: MobileMoneyProvider,
    phone: string,
  ) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error('Paiement introuvable');

    const result = await initiateMobileMoneyPayment(
      provider,
      phone,
      Number(payment.amount),
      paymentId,
    );

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        method: provider,
        status: result.status,
        transactionId: result.transactionRef,
      },
    });

    return { payment: updated, ...result };
  }

  static async handleWebhook(provider: MobileMoneyProvider, payload: Record<string, unknown>) {
    const verified = await verifyMobileMoneyWebhook(provider, payload);
    if (!verified) return null;

    const payment = await prisma.payment.findFirst({
      where: { transactionId: verified.transactionRef },
    });
    if (!payment) return null;

    return prisma.payment.update({
      where: { id: payment.id },
      data: { status: verified.status },
    });
  }

  static async getPaymentStatus(paymentId: string, userId: string) {
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
    });
    if (!payment) throw new Error('Paiement introuvable');
    return payment;
  }
}
