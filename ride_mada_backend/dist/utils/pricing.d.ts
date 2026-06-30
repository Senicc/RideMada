export type FareVehicleType = 'MOTORCYCLE' | 'TAXI' | 'ECONOMY' | 'COMFORT' | 'SEDAN' | 'SUV' | 'MINIBUS' | 'VAN' | 'DELIVERY';
export declare const estimateTripFare: (departureLat: number, departureLng: number, arrivalLat: number, arrivalLng: number, vehicleType?: FareVehicleType) => {
    distanceKm: number;
    price: number;
    durationMin: number;
    currency: "MGA";
    vehicleType: FareVehicleType;
};
//# sourceMappingURL=pricing.d.ts.map