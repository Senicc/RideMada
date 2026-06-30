const API_URL = 'http://localhost:5000/api';

export const fetchAutocomplete = async (token: string, input: string) => {
  const res = await fetch(`${API_URL}/maps/autocomplete?input=${encodeURIComponent(input)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.suggestions || [];
};

export const fetchReverseGeocode = async (token: string, lat: number, lng: number) => {
  const res = await fetch(`${API_URL}/maps/reverse?lat=${lat}&lng=${lng}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data;
};

export const fetchDirections = async (token: string, origin: { lat: number; lng: number }, dest: { lat: number; lng: number }) => {
  const res = await fetch(`${API_URL}/maps/directions?originLat=${origin.lat}&originLng=${origin.lng}&destLat=${dest.lat}&destLng=${dest.lng}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.route;
};

export const estimateFare = async (token: string, pickup: any, dropoff: any, vehicleType: string = 'SEDAN') => {
  const res = await fetch(`${API_URL}/rides/estimate-fare?departureLat=${pickup.lat}&departureLng=${pickup.lng}&arrivalLat=${dropoff.lat}&arrivalLng=${dropoff.lng}&vehicleType=${vehicleType}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
