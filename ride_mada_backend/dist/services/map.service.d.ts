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
                phone: string;
                name: string;
                password: string;
                email: string | null;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                photo: string | null;
                isVerified: boolean;
                fcmToken: string | null;
                rating: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            rating: number;
            status: import(".prisma/client").$Enums.DriverStatus;
            userId: string;
            documents: import("@prisma/client/runtime/library").JsonValue;
            currentLat: number | null;
            currentLng: number | null;
            isApproved: boolean;
        };
        vehicle: {
            id: string;
            seats: number;
            type: import(".prisma/client").$Enums.VehicleType;
            brand: string;
            model: string;
            color: string;
            plate: string;
            isActive: boolean;
            driverId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        departureLat: number;
        departureLng: number;
        arrivalLat: number;
        arrivalLng: number;
        status: import(".prisma/client").$Enums.RideStatus;
        driverId: string;
        departureAddress: string;
        arrivalAddress: string;
        departureTime: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        availableSeats: number;
        vehicleId: string;
    })[]>;
}
export default MapService;
//# sourceMappingURL=map.service.d.ts.map