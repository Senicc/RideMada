/** Sérialise les modèles Prisma pour l'API JSON (Decimal → number, Date → ISO). */
export declare function serializeRide<T extends {
    price: unknown;
    departureTime: Date;
}>(ride: T): T & {
    price: number;
    departureTime: string;
};
export declare function serializeRides<T extends {
    price: unknown;
    departureTime: Date;
}>(rides: T[]): (T & {
    price: number;
    departureTime: string;
})[];
//# sourceMappingURL=serialize.d.ts.map