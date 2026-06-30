"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateTripFare = void 0;
const distance_1 = require("./distance");
const RATES = {
    MOTORCYCLE: { base: 1500, perKm: 700, perMin: 50 },
    TAXI: { base: 2000, perKm: 1000, perMin: 80 },
    ECONOMY: { base: 2200, perKm: 1100, perMin: 90 },
    COMFORT: { base: 3000, perKm: 1400, perMin: 110 },
    SEDAN: { base: 2500, perKm: 1200, perMin: 100 },
    SUV: { base: 3500, perKm: 1500, perMin: 120 },
    MINIBUS: { base: 5000, perKm: 2000, perMin: 150 },
    VAN: { base: 5500, perKm: 2200, perMin: 160 },
    DELIVERY: { base: 1800, perKm: 800, perMin: 60 },
};
const PEAK_HOURS = [7, 8, 9, 17, 18, 19];
const estimateTripFare = (departureLat, departureLng, arrivalLat, arrivalLng, vehicleType = 'SEDAN') => {
    const distanceKm = (0, distance_1.calculateHaversineDistance)(departureLat, departureLng, arrivalLat, arrivalLng);
    const rates = RATES[vehicleType] ?? RATES.SEDAN;
    const durationMin = Math.max(5, Math.round(distanceKm * 2.8));
    let price = rates.base + distanceKm * rates.perKm + durationMin * rates.perMin;
    const hour = new Date().getHours();
    if (PEAK_HOURS.includes(hour)) {
        price *= 1.25;
    }
    return {
        distanceKm: Math.round(distanceKm * 100) / 100,
        price: Math.round(price),
        durationMin,
        currency: 'MGA',
        vehicleType,
    };
};
exports.estimateTripFare = estimateTripFare;
//# sourceMappingURL=pricing.js.map