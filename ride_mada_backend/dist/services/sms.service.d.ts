export declare const sendOTPSMS: (phone: string, otp: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const initiateMobileMoneyPayment: (phone: string, amount: number, orderId: string) => Promise<{
    success: boolean;
    transactionRef: string;
}>;
//# sourceMappingURL=sms.service.d.ts.map