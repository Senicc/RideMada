import { calculateHaversineDistance } from './distance';

export type FareVehicleType =
  | 'MOTORCYCLE'
  | 'TAXI'
  | 'ECONOMY'
  | 'COMFORT'
  | 'SEDAN'
  | 'SUV'
  | 'MINIBUS'
  | 'VAN'
  | 'DELIVERY';

const RATES: Record<FareVehicleType, { base: number; perKm: number; perMin: number }> = {
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

export const estimateTripFare = (
  departureLat: number,
  departureLng: number,
  arrivalLat: number,
  arrivalLng: number,
  vehicleType: FareVehicleType = 'SEDAN',
  options?: { distanceKm?: number; durationMin?: number }
) => {
  let distanceKm = options?.distanceKm;
  let durationMin = options?.durationMin;
  
  if (distanceKm === undefined) {
    distanceKm = calculateHaversineDistance(
      departureLat,
      departureLng,
      arrivalLat,
      arrivalLng,
    );
  }
  
  if (durationMin === undefined) {
    durationMin = Math.max(5, Math.round(distanceKm * 2.8));
  }
  
  const rates = RATES[vehicleType] ?? RATES.SEDAN;

  let price = rates.base + distanceKm * rates.perKm + durationMin * rates.perMin;
  const hour = new Date().getHours();
  if (PEAK_HOURS.includes(hour)) {
    price *= 1.25;
  }

  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    price: Math.round(price),
    durationMin,
    currency: 'MGA' as const,
    vehicleType,
  };
};
