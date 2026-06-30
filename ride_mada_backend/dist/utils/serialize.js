"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeRide = serializeRide;
exports.serializeRides = serializeRides;
/** Sérialise les modèles Prisma pour l'API JSON (Decimal → number, Date → ISO). */
function serializeRide(ride) {
    return {
        ...ride,
        price: Number(ride.price),
        departureTime: ride.departureTime.toISOString(),
    };
}
function serializeRides(rides) {
    return rides.map(serializeRide);
}
//# sourceMappingURL=serialize.js.map