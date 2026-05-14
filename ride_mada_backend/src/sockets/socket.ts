import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import prisma from '../config/db';
import { authenticateSocket } from '../middlewares/auth';

interface SocketUser {
  id: string;
  role?: string;
}

type AuthedSocket = Socket & { user: SocketUser };

export const initializeSocket = (io: Server) => {

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const authed = socket as AuthedSocket;
    if (!authed.user?.id) {
      socket.disconnect(true);
      return;
    }
    const user = authed.user;
    console.log(`🟢 User connected: ${user.id} | Socket: ${socket.id}`);

    // Rejoindre sa room personnelle
    socket.join(`user_${user.id}`);

    // ==================== TRACKING GPS ====================
    socket.on('updateDriverLocation', async (data: { lat: number; lng: number; rideId?: string }) => {
      try {
        await prisma.driver.update({
          where: { userId: user.id },
          data: {
            currentLat: data.lat,
            currentLng: data.lng,
            status: 'ONLINE'
          }
        });

        // Broadcast à tous les passagers à proximité
        io.emit('driverLocationUpdate', {
          driverId: user.id,
          lat: data.lat,
          lng: data.lng,
          timestamp: new Date()
        });

        // Si en course → broadcast dans la room du trajet
        if (data.rideId) {
          io.to(`ride_${data.rideId}`).emit('rideLocationUpdate', {
            driverId: user.id,
            lat: data.lat,
            lng: data.lng
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Erreur mise à jour position' });
      }
    });

    // ==================== CHAT TEMPS RÉEL ====================
    socket.on('joinRideRoom', (rideId: string) => {
      socket.join(`ride_${rideId}`);
      socket.emit('joinedRoom', { rideId });
    });

    socket.on('sendMessage', async (data: { receiverId: string; rideId?: string; content: string }) => {
      try {
        const message = await prisma.message.create({
          data: {
            senderId: user.id,
            receiverId: data.receiverId,
            rideId: data.rideId,
            content: data.content
          },
          include: { sender: true }
        });

        // Envoyer au destinataire
        io.to(`user_${data.receiverId}`).emit('newMessage', message);
        
        // Envoyer dans la room du trajet si applicable
        if (data.rideId) {
          io.to(`ride_${data.rideId}`).emit('newMessage', message);
        }
      } catch (error) {
        socket.emit('error', { message: "Échec envoi message" });
      }
    });

    // ==================== ÉVÉNEMENTS COURSE ====================
    socket.on('driverStartedRide', (rideId: string) => {
      io.to(`ride_${rideId}`).emit('rideStarted', { rideId, driverId: user.id });
    });

    socket.on('driverArrived', (rideId: string) => {
      io.to(`ride_${rideId}`).emit('driverArrived', { rideId });
    });

    socket.on('rideCompleted', async (rideId: string) => {
      await prisma.ride.update({
        where: { id: rideId },
        data: { status: 'COMPLETED' }
      });
      io.to(`ride_${rideId}`).emit('rideCompleted', { rideId });
    });

    // ==================== STATUT CONDUCTEUR ====================
    socket.on('updateDriverStatus', async (status: 'ONLINE' | 'OFFLINE' | 'ON_RIDE') => {
      await prisma.driver.update({
        where: { userId: user.id },
        data: { status }
      });
      io.emit('driverStatusChanged', { driverId: user.id, status });
    });

    // ==================== DISCONNECTION ====================
    socket.on('disconnect', async () => {
      console.log(`🔴 User disconnected: ${user.id}`);
      try {
        await prisma.driver.update({
          where: { userId: user.id },
          data: { status: 'OFFLINE' }
        });
      } catch (_) {}
    });
  });
};