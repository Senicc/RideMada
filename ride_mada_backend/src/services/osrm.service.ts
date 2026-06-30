export async function osrmGetRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
) {
  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=polyline`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as any;

    if (data.code !== 'Ok' || !data.routes?.length) return null;

    const route = data.routes[0];
    return {
      distanceKm: Math.round((route.distance / 1000) * 100) / 100,
      durationMin: Math.round(route.duration / 60),
      polyline: route.geometry, // OSRM retourne la string polyline dans route.geometry
    };
  } catch (error) {
    console.error('OSRM Error', error);
    return null;
  }
}

export async function nominatimSearch(query: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query,
    )}&format=json&limit=5&countrycodes=mg`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'RideMada/1.0',
      },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as any;
    return data.map((item: any) => ({
      description: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (error) {
    console.error('Nominatim Error', error);
    return [];
  }
}
