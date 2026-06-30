export declare class NotificationService {
    static createInAppNotification(userId: string, title: string, body: string, type?: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        userId: string;
        title: string;
        body: string;
        isRead: boolean;
    }>;
    static sendPushNotification(userId: string, title: string, body: string, data?: Record<string, string>): Promise<void>;
    static notifyNewBooking(rideId: string, passengerName: string, seats: number): Promise<void>;
}
export default NotificationService;
//# sourceMappingURL=notification.service.d.ts.map