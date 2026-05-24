import prisma from '../config/db';

export class PaymentService {
  static async confirmCashPayment(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
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

    const amount = Number(booking.ride.price) * booking.seats;
    const completed = booking.payments.find((p) => p.status === 'COMPLETED');
    if (completed) {
      return completed;
    }

    return prisma.payment.create({
      data: {
        bookingId,
        userId: booking.passengerId,
        amount,
        method: 'CASH',
        status: 'COMPLETED',
      },
    });
  }
}
