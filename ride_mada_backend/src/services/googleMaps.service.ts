import { osrmGetRoute, nominatimSearch } from './osrm.service';

const MADAGASCAR_FALLBACK: Record<string, { lat: number; lng: number; formatted: string }> = {
  ivato: { lat: -18.7969, lng: 47.4788, formatted: 'Aéroport Ivato, Antananarivo' },
  analakely: { lat: -18.9137, lng: 47.5219, formatted: 'Analakely, Antananarivo' },
  ankorondrano: { lat: -18.8762, lng: 47.5258, formatted: 'Ankorondrano, Antananarivo' },
  itasy: { lat: -19.0883, lng: 47.245, formatted: 'Itasy' },
  tana: { lat: -18.8792, lng: 47.5079, formatted: 'Antananarivo' },
};

function fallbackGeocode(address: string): { lat: number; lng: number; formatted: string } {
  const key = Object.keys(MADAGASCAR_FALLBACK).find((k) => address.toLowerCase().includes(k));
  if (key) {
    const hit = MADAGASCAR_FALLBACK[key];
    if (hit) return hit;
  }
  return { lat: -18.8792, lng: 47.5079, formatted: address };
}

async function googleFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function geocodeAddress(address: string) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    // Essayer avec Nominatim d'abord
    const nom = await nominatimSearch(address);
    if (nom && nom.length > 0) {
      return { lat: nom[0].lat, lng: nom[0].lng, formattedAddress: nom[0].description, source: 'nominatim' as const };
    }
    const fb = fallbackGeocode(address);
    return { lat: fb.lat, lng: fb.lng, formattedAddress: fb.formatted, source: 'fallback' as const };
  }

  type GeocodeResponse = {
    status: string;
    results?: Array<{ formatted_address: string; geometry: { location: { lat: number; lng: number } } }>;
  };

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}&region=mg&language=fr`;
  const data = await googleFetch<GeocodeResponse>(url);
  const result = data?.results?.[0];
  if (data?.status !== 'OK' || !result) {
    const fb = fallbackGeocode(address);
    return { lat: fb.lat, lng: fb.lng, formattedAddress: fb.formatted, source: 'fallback' as const };
  }

  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
    source: 'google' as const,
  };
}

export async function reverseGeocode(lat: number, lng: number) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return { formattedAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, source: 'fallback' as const };
  }

  type GeocodeResponse = {
    status: string;
    results?: Array<{ formatted_address: string }>;
  };

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}&language=fr`;
  const data = await googleFetch<GeocodeResponse>(url);
  const result = data?.results?.[0];
  return {
    formattedAddress: result?.formatted_address ?? `${lat}, ${lng}`,
    source: data?.status === 'OK' ? ('google' as const) : ('fallback' as const),
  };
}

export async function autocompleteAddress(input: string) {
  const trimmed = input.trim();
  if (trimmed.length < 2) return [];

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    // Utiliser Nominatim comme fallback pour l'autocomplétion
    const results = await nominatimSearch(trimmed);
    return results;
  }

  type AutocompleteResponse = {
    status: string;
    predictions?: Array<{ description: string; place_id: string }>;
  };

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(trimmed)}&key=${key}&components=country:mg&language=fr`;
  const data = await googleFetch<AutocompleteResponse>(url);
  if (data?.status !== 'OK' || !data.predictions?.length) return [];

  const results = await Promise.all(
    data.predictions.slice(0, 6).map(async (p) => {
      type DetailResponse = {
        status: string;
        result?: { geometry: { location: { lat: number; lng: number } } };
      };
      const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=geometry&key=${key}`;
      const detail = await googleFetch<DetailResponse>(detailUrl);
      const loc = detail?.result?.geometry.location;
      return {
        description: p.description,
        placeId: p.place_id,
        lat: loc?.lat ?? null,
        lng: loc?.lng ?? null,
      };
    }),
  );

  return results;
}

export async function getDirections(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
) {
  const key = process.env.GOOGLE_MAPS_API_KEY;

  if (key && !key.includes('...')) {
    type DirectionsResponse = {
      status: string;
      routes?: Array<{
        legs: Array<{ distance: { value: number }; duration: { value: number } }>;
        overview_polyline: { points: string };
      }>;
    };

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${key}&language=fr`;
    const data = await googleFetch<DirectionsResponse>(url);
    const route = data?.routes?.[0];
    const leg = route?.legs?.[0];

    if (route && leg) {
      return {
        distanceKm: Math.round((leg.distance.value / 1000) * 100) / 100,
        durationMin: Math.round(leg.duration.value / 60),
        polyline: route.overview_polyline.points,
      };
    }
  }

  // Fallback sur OSRM pour calculer le vrai chemin si Google a échoué ou pas de clé valide
  const osrmRoute = await osrmGetRoute(originLat, originLng, destLat, destLng);
  if (osrmRoute) {
    return {
      distanceKm: osrmRoute.distanceKm,
      durationMin: osrmRoute.durationMin,
      polyline: osrmRoute.polyline,
    };
  }
  
  return null;
}
