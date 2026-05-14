export interface UserPayload {
  id: string;
  role: 'PASSENGER' | 'DRIVER' | 'ADMIN';
  iat?: number;
  exp?: number;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface RideFilters {
  departureLat?: number;
  departureLng?: number;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  vehicleType?: string;
  departureTime?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  errors?: any;
}

export interface SocketEvents {
  updateDriverLocation: (data: { lat: number; lng: number; rideId?: string }) => void;
  sendMessage: (data: { receiverId: string; content: string; rideId?: string }) => void;
  joinRideRoom: (rideId: string) => void;
}