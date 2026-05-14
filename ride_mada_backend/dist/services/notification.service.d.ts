export declare class NotificationService {
    static sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void>;
    static notifyNewBooking(rideId: string, passengerName: string): Promise<void>;
    static notifyDriverArrived(rideId: string): Promise<void>;
}
export default NotificationService;
//# sourceMappingURL=notification.service.d.ts.map