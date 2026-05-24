import { calculateHaversineDistance } from './distance';

export type FareVehicleType = 'SEDAN' | 'SUV' | 'MINIBUS' | 'MOTORCYCLE';

const RATES: Record<FareVehicleType, { base: number; perKm: number }> = {
  MOTORCYCLE: { base: 1500, perKm: 700 },
  SEDAN: { base: 2500, perKm: 1200 },
  SUV: { base: 3500, perKm: 1500 },
  MINIBUS: { base: 5000, perKm: 2000 },
};

export const estimateTripFare = (
  departureLat: number,
  departureLng: number,
  arrivalLat: number,
  arrivalLng: number,
  vehicleType: FareVehicleType = 'SEDAN',
) => {
  const distanceKm = calculateHaversineDistance(
    departureLat,
    departureLng,
    arrivalLat,
    arrivalLng,
  );
  const rates = RATES[vehicleType] ?? RATES.SEDAN;
  const price = Math.round(rates.base + distanceKm * rates.perKm);
  const durationMin = Math.max(5, Math.round(distanceKm * 2.8));
  return { distanceKm: Math.round(distanceKm * 100) / 100, price, durationMin, currency: 'MGA' as const };
};
