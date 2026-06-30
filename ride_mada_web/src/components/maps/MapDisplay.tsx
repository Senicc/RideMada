import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useBookingStore } from '../../store';
import { fetchReverseGeocode, fetchDirections, estimateFare } from '../../services/api';
import polylineUtil from '@mapbox/polyline';

// Fix Leaflet default icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color: string, size: number = 24) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const pickupIcon = createCustomIcon('#6c5ce7'); // Accent
const dropoffIcon = createCustomIcon('#00b894'); // Green
const driverIcon = L.divIcon({
  className: 'driver-icon',
  html: `<div style="background-color: #fdcb6e; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface Props {
  token: string;
}

// Component to auto-fit bounds
function MapBounds() {
  const map = useMap();
  const { pickup, dropoff, route } = useBookingStore();

  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds([pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 15);
    }
  }, [pickup, dropoff, route, map]);

  return null;
}

function MapClickHandler({ token }: { token: string }) {
  const { pickup, dropoff, setPickup, setDropoff, setRoute, setFare } = useBookingStore();

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      
      try {
        const reverseData = await fetchReverseGeocode(token, lat, lng);
        const address = reverseData.formattedAddress || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        const newPoint = { lat, lng, address };

        if (!pickup) {
          setPickup(newPoint);
        } else if (!dropoff) {
          setDropoff(newPoint);
          // Calculate route and fare
          const routeData = await fetchDirections(token, pickup, newPoint);
          setRoute(routeData);
          // Get fare from backend
          const fareData = await estimateFare(token, pickup, newPoint, 'SEDAN');
          if (fareData.estimate) {
            setFare(fareData.estimate);
          }
        } else {
          // If both are set, set new dropoff
          setDropoff(newPoint);
          const routeData = await fetchDirections(token, pickup, newPoint);
          setRoute(routeData);
          const fareData = await estimateFare(token, pickup, newPoint, 'SEDAN');
          if (fareData.estimate) {
            setFare(fareData.estimate);
          }
        }
      } catch (error) {
        console.error('Error handling map click:', error);
      }
    },
  });

  return null;
}

export default function MapDisplay({ token }: Props) {
  const { pickup, dropoff, route, driverLocation } = useBookingStore();
  const mapRef = useRef<L.Map>(null);

  // Parse polyline string to array of [lat, lng]
  let positions: [number, number][] = [];
  if (route?.polyline) {
    try {
      positions = polylineUtil.decode(route.polyline);
    } catch (e) {
      console.error('Failed to decode polyline:', e);
    }
  } else if (route?.geometry?.coordinates) {
    positions = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      <MapContainer
        center={[-18.8792, 47.5079]} // Antananarivo par défaut
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
        {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon} />}
        
        {positions.length > 0 && (
          <Polyline positions={positions} color="#6c5ce7" weight={5} opacity={0.8} />
        )}

        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
        )}

        <MapBounds />
        <MapClickHandler token={token} />
      </MapContainer>
    </div>
  );
}
