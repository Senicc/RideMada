import { io, Socket } from 'socket.io-client';
import { useBookingStore } from '../store';

let socket: Socket | null = null;

export const initSocket = (token: string) => {
  if (socket) return socket;
  
  socket = io('http://localhost:5000', {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log('Socket connecté');
  });

  socket.on('driverLocationUpdate', (data: { lat: number; lng: number }) => {
    useBookingStore.getState().setDriverLocation({ lat: data.lat, lng: data.lng });
  });

  socket.on('rideRequestStatusUpdate', (data: { id: string; status: any }) => {
    useBookingStore.getState().setStatus(data.status);
  });

  return socket;
};

export const getSocket = () => socket;
