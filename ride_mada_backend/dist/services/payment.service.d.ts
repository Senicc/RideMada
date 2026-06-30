export declare class PaymentService {
    static confirmCashPayment(bookingId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        bookingId: string | null;
        rideRequestId: string | null;
        method: string;
        transactionId: string | null;
    }>;
    static confirmCashPaymentForRideRequest(rideRequestId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        bookingId: string | null;
        rideRequestId: string | null;
        method: string;
        transactionId: string | null;
    }>;
}
//# sourceMappingURL=payment.service.d.ts.map