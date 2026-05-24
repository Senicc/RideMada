import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import prisma from '../config/db';
import { authenticateSocket } from '../middlewares/auth';

interface SocketUser {
  id: string;
  role?: string;
}

type AuthedSocket = Socket & { user: SocketUser };

async function userCanAccessRide(userId: string, rideId: string): Promise<boolean> {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { driver: true, bookings: { where: { status: 'CONFIRMED' } } },
  });
  if (!ride) return false;
  if (ride.driver.userId === userId) return true;
  return ride.bookings.some((b) => b.passengerId === userId);
}

async function userIsRideDriver(userId: string, rideId: string): Promise<boolean> {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { driver: true },
  });
  return ride?.driver.userId === userId;
}

export const initializeSocket = (io: Server) => {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const authed = socket as AuthedSocket;
    if (!authed.user?.id) {
      socket.disconnect(true);
      return;
    }
    const user = authed.user;

    socket.join(`user_${user.id}`);

    socket.on('updateDriverLocation', async (data: { lat: number; lng: number; rideId?: string }) => {
      try {
        if (user.role !== 'DRIVER') return;

        const driver = await prisma.driver.findUnique({ where: { userId: user.id } });
        if (!driver?.isApproved) return;

        await prisma.driver.update({
          where: { userId: user.id },
          data: { currentLat: data.lat, currentLng: data.lng, status: 'ONLINE' },
        });

        const payload = {
          driverId: user.id,
          lat: data.lat,
          lng: data.lng,
          timestamp: new Date(),
        };

        if (data.rideId) {
          io.to(`ride_${data.rideId}`).emit('driverLocationUpdate', payload);
        } else {
          socket.broadcast.emit('driverLocationUpdate', payload);
        }
      } catch {
        socket.emit('error', { message: 'Erreur mise à jour position' });
      }
    });

    socket.on('joinRideRoom', async (rideId: string) => {
      if (!rideId || !(await userCanAccessRide(user.id, rideId))) {
        socket.emit('error', { message: 'Accès à la course refusé' });
        return;
      }
      socket.join(`ride_${rideId}`);
      socket.emit('joinedRoom', { rideId });
    });

    socket.on('sendMessage', async (data: { receiverId: string; rideId?: string; content: string }) => {
      try {
        const content = (data.content ?? '').trim().slice(0, 2000);
        if (!content || !data.receiverId) return;

        if (data.rideId && !(await userCanAccessRide(user.id, data.rideId))) {
          socket.emit('error', { message: 'Message refusé' });
          return;
        }

        const message = await prisma.message.create({
          data: {
            senderId: user.id,
            receiverId: data.receiverId,
            rideId: data.rideId,
            content,
          },
          include: { sender: { select: { id: true, name: true, photo: true } } },
        });

        io.to(`user_${data.receiverId}`).emit('newMessage', message);
        if (data.rideId) {
          io.to(`ride_${data.rideId}`).emit('newMessage', message);
        }
      } catch {
        socket.emit('error', { message: 'Échec envoi message' });
      }
    });

    socket.on('driverStartedRide', async (rideId: string) => {
      if (await userIsRideDriver(user.id, rideId)) {
        io.to(`ride_${rideId}`).emit('rideStarted', { rideId, driverId: user.id });
      }
    });

    socket.on('driverArrived', async (rideId: string) => {
      if (await userIsRideDriver(user.id, rideId)) {
        io.to(`ride_${rideId}`).emit('driverArrived', { rideId });
      }
    });

    socket.on('rideCompleted', async (rideId: string) => {
      if (!(await userIsRideDriver(user.id, rideId))) return;
      await prisma.ride.update({
        where: { id: rideId },
        data: { status: 'COMPLETED' },
      });
      io.to(`ride_${rideId}`).emit('rideCompleted', { rideId });
    });

    socket.on('updateDriverStatus', async (status: 'ONLINE' | 'OFFLINE' | 'ON_RIDE') => {
      if (user.role !== 'DRIVER') return;
      try {
        await prisma.driver.update({
          where: { userId: user.id },
          data: { status },
        });
        socket.broadcast.emit('driverStatusChanged', { driverId: user.id, status });
      } catch {
        /* passager sans profil conducteur */
      }
    });

    socket.on('disconnect', async () => {
      if (user.role !== 'DRIVER') return;
      try {
        await prisma.driver.update({
          where: { userId: user.id },
          data: { status: 'OFFLINE' },
        });
      } catch {
        /* ignore */
      }
    });
  });
};
