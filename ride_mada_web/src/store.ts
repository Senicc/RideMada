import { create } from 'zustand';

export type Point = { lat: number; lng: number; address: string };
export type RouteData = { distanceKm: number; durationMin: number; polyline?: string; geometry?: any };
export type FareEstimate = { distanceKm: number; price: number; durationMin: number; currency: string; vehicleType: string };

interface BookingState {
  pickup: Point | null;
  dropoff: Point | null;
  route: RouteData | null;
  fare: FareEstimate | null;
  driverLocation: { lat: number; lng: number } | null;
  status: 'IDLE' | 'SEARCHING' | 'ACCEPTED' | 'DRIVER_ARRIVING' | 'IN_PROGRESS' | 'COMPLETED';
  
  setPickup: (p: Point | null) => void;
  setDropoff: (p: Point | null) => void;
  setRoute: (r: RouteData | null) => void;
  setFare: (f: FareEstimate | null) => void;
  setDriverLocation: (loc: { lat: number; lng: number } | null) => void;
  setStatus: (s: BookingState['status']) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  pickup: null,
  dropoff: null,
  route: null,
  fare: null,
  driverLocation: null,
  status: 'IDLE',

  setPickup: (pickup) => set({ pickup }),
  setDropoff: (dropoff) => set({ dropoff }),
  setRoute: (route) => set({ route }),
  setFare: (fare) => set({ fare }),
  setDriverLocation: (driverLocation) => set({ driverLocation }),
  setStatus: (status) => set({ status }),
  reset: () => set({ pickup: null, dropoff: null, route: null, fare: null, driverLocation: null, status: 'IDLE' }),
}));
