export declare function geocodeAddress(address: string): Promise<{
    lat: number;
    lng: number;
    formattedAddress: string;
    source: "fallback";
} | {
    lat: number;
    lng: number;
    formattedAddress: string;
    source: "google";
}>;
export declare function reverseGeocode(lat: number, lng: number): Promise<{
    formattedAddress: string;
    source: "fallback" | "google";
}>;
export declare function autocompleteAddress(input: string): Promise<{
    description: string;
    placeId: string | null;
    lat: number;
    lng: number;
}[] | {
    description: string;
    placeId: string;
    lat: number | null;
    lng: number | null;
}[]>;
export declare function getDirections(originLat: number, originLng: number, destLat: number, destLng: number): Promise<{
    distanceKm: number;
    durationMin: number;
    polyline: string;
} | null>;
//# sourceMappingURL=googleMaps.service.d.ts.map