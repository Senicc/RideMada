import prisma from '../config/db';

export class MapService {

  // Recherche conducteurs proches avec PostGIS
  static async findNearbyDrivers(lat: number, lng: number, radiusKm: number = 10) {
    const drivers = await prisma.$queryRaw`
      SELECT 
        d.*,
        u.name,
        u.photo,
        u.rating,
        v.brand,
        v.model,
        v.plate,
        v.seats,
        ST_Distance(
          ST_MakePoint(d.current_lng, d.current_lat)::geography,
          ST_MakePoint(${lng}, ${lat})::geography
        ) / 1000 as distance_km
      FROM "Driver" d
      JOIN "User" u ON u.id = d."userId"
      LEFT JOIN "Vehicle" v ON v."driverId" = d.id
      WHERE d.status = 'ONLINE'
        AND d."isApproved" = true
        AND d.current_lat IS NOT NULL
        AND ST_DWithin(
          ST_MakePoint(d.current_lng, d.current_lat)::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radiusKm * 1000}
        )
      ORDER BY distance_km ASC
      LIMIT 20;
    `;
    return drivers;
  }

  // Calcul distance + durée estimée
  static async calculateRoute(departureLat: number, departureLng: number, arrivalLat: number, arrivalLng: number) {
    const result = await prisma.$queryRaw`
      SELECT 
        ST_Distance(
          ST_MakePoint(${departureLng}, ${departureLat})::geography,
          ST_MakePoint(${arrivalLng}, ${arrivalLat})::geography
        ) / 1000 as distance_km;
    `;

    const distance = (result as any)[0].distance_km;
    const durationMin = Math.round(distance * 2.5); // Estimation Madagascar

    return {
      distanceKm: parseFloat(distance.toFixed(2)),
      durationMinutes: durationMin,
      priceEstimate: Math.round(distance * 800) // Ar / km (à ajuster)
    };
  }

  // Recherche par adresse (avec filtre)
  static async searchRidesByLocation(lat: number, lng: number, filters: any) {
    // Combinaison PostGIS + filtres métier
    return await prisma.ride.findMany({
      where: {
        status: 'PENDING',
        availableSeats: { gt: 0 },
        departureTime: { gt: new Date() }
      },
      include: {
        driver: { include: { user: true } },
        vehicle: true
      },
      orderBy: { departureTime: 'asc' }
    });
  }
}

export default MapService;