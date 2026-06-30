import type { Request, Response } from 'express';
import {
  autocompleteAddress,
  geocodeAddress,
  getDirections,
  reverseGeocode,
} from '../services/googleMaps.service';

export const geocode = async (req: Request, res: Response) => {
  const address = String(req.query.address ?? '').trim();
  if (!address) {
    return res.status(400).json({ success: false, message: 'address requis' });
  }
  const result = await geocodeAddress(address);
  res.json({ success: true, ...result });
};

export const reverse = async (req: Request, res: Response) => {
  const lat = parseFloat(String(req.query.lat));
  const lng = parseFloat(String(req.query.lng));
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ success: false, message: 'lat et lng requis' });
  }
  const result = await reverseGeocode(lat, lng);
  res.json({ success: true, lat, lng, ...result });
};

export const autocomplete = async (req: Request, res: Response) => {
  const input = String(req.query.input ?? '').trim();
  if (input.length < 2) {
    return res.json({ success: true, suggestions: [] });
  }
  const suggestions = await autocompleteAddress(input);
  res.json({ success: true, suggestions });
};

export const directions = async (req: Request, res: Response) => {
  const originLat = parseFloat(String(req.query.originLat));
  const originLng = parseFloat(String(req.query.originLng));
  const destLat = parseFloat(String(req.query.destLat));
  const destLng = parseFloat(String(req.query.destLng));
  if ([originLat, originLng, destLat, destLng].some(Number.isNaN)) {
    return res.status(400).json({ success: false, message: 'Coordonnées invalides' });
  }
  let result = await getDirections(originLat, originLng, destLat, destLng);
  if (!result) {
    // Fallback: calculate approximate distance using haversine formula
    function toRad(deg: number) {
      return deg * (Math.PI / 180);
    }
    const R = 6371; // Radius of earth in km
    const dLat = toRad(destLat - originLat);
    const dLon = toRad(destLng - originLng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
      Math.cos(toRad(originLat)) * Math.cos(toRad(destLat)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const distance = R * c; // Distance in km
    
    // Approximate duration: assume average speed 40 km/h
    const duration = Math.max(5, Math.round((distance / 40) * 60));
    
    // Fallback geometry: straight line
    const geometry = {
      type: "LineString",
      coordinates: [[originLng, originLat], [destLng, destLat]]
    };
    
    result = {
      distanceKm: Math.round(distance * 100) / 100,
      durationMin: duration,
      geometry: geometry
    } as any;
  }
  res.json({ success: true, route: result });
};
