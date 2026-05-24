/** Sérialise les modèles Prisma pour l'API JSON (Decimal → number, Date → ISO). */
export function serializeRide<T extends { price: unknown; departureTime: Date }>(ride: T) {
  return {
    ...ride,
    price: Number(ride.price),
    departureTime: ride.departureTime.toISOString(),
  };
}

export function serializeRides<T extends { price: unknown; departureTime: Date }>(rides: T[]) {
  return rides.map(serializeRide);
}
