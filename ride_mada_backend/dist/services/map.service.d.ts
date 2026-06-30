export declare class MapService {
    static findNearbyDrivers(lat: number, lng: number, radiusKm?: number): Promise<unknown>;
    static calculateRoute(departureLat: number, departureLng: number, arrivalLat: number, arrivalLng: number): Promise<{
        distanceKm: number;
        durationMinutes: number;
        priceEstimate: number;
    }>;
    static searchRidesByLocation(lat: number, lng: number, filters: any): Promise<({
        driver: {
            user: {
                id: string;
                role: import("@prisma/client").$Enums.Role;
                phone: string;
                name: string;
                password: string;
                email: string | null;
                photo: string | null;
                isVerified: boolean;
                fcmToken: string | null;
                rating: number;
                otpCode: string | null;
                otpExpires: Date | null;
                isBlocked: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            rating: number;
            userId: string;
            status: import("@prisma/client").$Enums.DriverStatus;
            currentLat: number | null;
            currentLng: number | null;
            isApproved: boolean;
            documents: import("@prisma/client/runtime/library").JsonValue;
        };
        vehicle: {
            id: string;
            type: import("@prisma/client").$Enums.VehicleType;
            seats: number;
            brand: string;
            model: string;
            color: string;
            plate: string;
            driverId: string;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        departureLat: number;
        departureLng: number;
        arrivalLat: number;
        arrivalLng: number;
        status: import("@prisma/client").$Enums.RideStatus;
        driverId: string;
        vehicleId: string;
        departureAddress: string;
        arrivalAddress: string;
        departureTime: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        availableSeats: number;
    })[]>;
}
export default MapService;
//# sourceMappingURL=map.service.d.ts.map