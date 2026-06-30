"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodeAddress = geocodeAddress;
exports.reverseGeocode = reverseGeocode;
exports.autocompleteAddress = autocompleteAddress;
exports.getDirections = getDirections;
const MADAGASCAR_FALLBACK = {
    ivato: { lat: -18.7969, lng: 47.4788, formatted: 'Aéroport Ivato, Antananarivo' },
    analakely: { lat: -18.9137, lng: 47.5219, formatted: 'Analakely, Antananarivo' },
    ankorondrano: { lat: -18.8762, lng: 47.5258, formatted: 'Ankorondrano, Antananarivo' },
    itasy: { lat: -19.0883, lng: 47.245, formatted: 'Itasy' },
    tana: { lat: -18.8792, lng: 47.5079, formatted: 'Antananarivo' },
};
function fallbackGeocode(address) {
    const key = Object.keys(MADAGASCAR_FALLBACK).find((k) => address.toLowerCase().includes(k));
    if (key) {
        const hit = MADAGASCAR_FALLBACK[key];
        if (hit)
            return hit;
    }
    return { lat: -18.8792, lng: 47.5079, formatted: address };
}
async function googleFetch(url) {
    try {
        const res = await fetch(url);
        if (!res.ok)
            return null;
        return (await res.json());
    }
    catch {
        return null;
    }
}
async function geocodeAddress(address) {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
        const fb = fallbackGeocode(address);
        return { lat: fb.lat, lng: fb.lng, formattedAddress: fb.formatted, source: 'fallback' };
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}&region=mg&language=fr`;
    const data = await googleFetch(url);
    const result = data?.results?.[0];
    if (data?.status !== 'OK' || !result) {
        const fb = fallbackGeocode(address);
        return { lat: fb.lat, lng: fb.lng, formattedAddress: fb.formatted, source: 'fallback' };
    }
    return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        source: 'google',
    };
}
async function reverseGeocode(lat, lng) {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
        return { formattedAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, source: 'fallback' };
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}&language=fr`;
    const data = await googleFetch(url);
    const result = data?.results?.[0];
    return {
        formattedAddress: result?.formatted_address ?? `${lat}, ${lng}`,
        source: data?.status === 'OK' ? 'google' : 'fallback',
    };
}
async function autocompleteAddress(input) {
    const trimmed = input.trim();
    if (trimmed.length < 2)
        return [];
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
        return Object.values(MADAGASCAR_FALLBACK)
            .filter((p) => p.formatted.toLowerCase().includes(trimmed.toLowerCase()))
            .map((p) => ({ description: p.formatted, placeId: null, lat: p.lat, lng: p.lng }));
    }
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(trimmed)}&key=${key}&components=country:mg&language=fr`;
    const data = await googleFetch(url);
    if (data?.status !== 'OK' || !data.predictions?.length)
        return [];
    const results = await Promise.all(data.predictions.slice(0, 6).map(async (p) => {
        const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=geometry&key=${key}`;
        const detail = await googleFetch(detailUrl);
        const loc = detail?.result?.geometry.location;
        return {
            description: p.description,
            placeId: p.place_id,
            lat: loc?.lat ?? null,
            lng: loc?.lng ?? null,
        };
    }));
    return results;
}
async function getDirections(originLat, originLng, destLat, destLng) {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key)
        return null;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${key}&language=fr`;
    const data = await googleFetch(url);
    const route = data?.routes?.[0];
    if (!route)
        return null;
    const leg = route.legs[0];
    if (!leg)
        return null;
    return {
        distanceKm: Math.round((leg.distance.value / 1000) * 100) / 100,
        durationMin: Math.round(leg.duration.value / 60),
        polyline: route.overview_polyline.points,
    };
}
//# sourceMappingURL=googleMaps.service.js.map