"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapService = void 0;
const db_1 = __importDefault(require("../config/db"));
class MapService {
    // Recherche conducteurs proches avec PostGIS
    static async findNearbyDrivers(lat, lng, radiusKm = 10) {
        const drivers = await db_1.default.$queryRaw `
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
    static async calculateRoute(departureLat, departureLng, arrivalLat, arrivalLng) {
        const result = await db_1.default.$queryRaw `
      SELECT 
        ST_Distance(
          ST_MakePoint(${departureLng}, ${departureLat})::geography,
          ST_MakePoint(${arrivalLng}, ${arrivalLat})::geography
        ) / 1000 as distance_km;
    `;
        const distance = result[0].distance_km;
        const durationMin = Math.round(distance * 2.5); // Estimation Madagascar
        return {
            distanceKm: parseFloat(distance.toFixed(2)),
            durationMinutes: durationMin,
            priceEstimate: Math.round(distance * 800) // Ar / km (à ajuster)
        };
    }
    // Recherche par adresse (avec filtre)
    static async searchRidesByLocation(lat, lng, filters) {
        // Combinaison PostGIS + filtres métier
        return await db_1.default.ride.findMany({
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
exports.MapService = MapService;
exports.default = MapService;
//# sourceMappingURL=map.service.js.map