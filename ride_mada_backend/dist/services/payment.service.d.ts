export declare class PaymentService {
    static confirmCashPayment(bookingId: string, driverId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        userId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        method: string;
        transactionId: string | null;
        bookingId: string;
    }>;
}
//# sourceMappingURL=payment.service.d.ts.map