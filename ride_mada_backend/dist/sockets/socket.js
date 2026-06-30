"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
const db_1 = __importDefault(require("../config/db"));
const auth_1 = require("../middlewares/auth");
async function userCanAccessRide(userId, rideId) {
    const ride = await db_1.default.ride.findUnique({
        where: { id: rideId },
        include: { driver: true, bookings: { where: { status: 'CONFIRMED' } } },
    });
    if (!ride)
        return false;
    if (ride.driver.userId === userId)
        return true;
    return ride.bookings.some((b) => b.passengerId === userId);
}
async function userIsRideDriver(userId, rideId) {
    const ride = await db_1.default.ride.findUnique({
        where: { id: rideId },
        include: { driver: true },
    });
    return ride?.driver.userId === userId;
}
const initializeSocket = (io) => {
    io.use(auth_1.authenticateSocket);
    io.on('connection', (socket) => {
        const authed = socket;
        if (!authed.user?.id) {
            socket.disconnect(true);
            return;
        }
        const user = authed.user;
        socket.join(`user_${user.id}`);
        socket.on('updateDriverLocation', async (data) => {
            try {
                if (user.role !== 'DRIVER')
                    return;
                const driver = await db_1.default.driver.findUnique({ where: { userId: user.id } });
                if (!driver?.isApproved)
                    return;
                await db_1.default.driver.update({
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
                }
                else {
                    socket.broadcast.emit('driverLocationUpdate', payload);
                }
            }
            catch {
                socket.emit('error', { message: 'Erreur mise à jour position' });
            }
        });
        socket.on('joinRideRoom', async (rideId) => {
            if (!rideId || !(await userCanAccessRide(user.id, rideId))) {
                socket.emit('error', { message: 'Accès à la course refusé' });
                return;
            }
            socket.join(`ride_${rideId}`);
            socket.emit('joinedRoom', { rideId });
        });
        socket.on('joinRideRequestRoom', async (rideRequestId) => {
            if (!rideRequestId)
                return;
            const request = await db_1.default.rideRequest.findUnique({
                where: { id: rideRequestId },
                include: { driver: true },
            });
            if (!request)
                return;
            const isPassenger = request.passengerId === user.id;
            const isDriver = request.driver?.userId === user.id;
            if (!isPassenger && !isDriver && user.role !== 'ADMIN') {
                socket.emit('error', { message: 'Accès refusé' });
                return;
            }
            socket.join(`ride_request_${rideRequestId}`);
            socket.emit('joinedRoom', { rideRequestId });
        });
        socket.on('sendMessage', async (data) => {
            try {
                const content = (data.content ?? '').trim().slice(0, 2000);
                if (!content || !data.receiverId)
                    return;
                if (data.rideId && !(await userCanAccessRide(user.id, data.rideId))) {
                    socket.emit('error', { message: 'Message refusé' });
                    return;
                }
                const message = await db_1.default.message.create({
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
            }
            catch {
                socket.emit('error', { message: 'Échec envoi message' });
            }
        });
        socket.on('driverStartedRide', async (rideId) => {
            if (await userIsRideDriver(user.id, rideId)) {
                await db_1.default.ride.update({ where: { id: rideId }, data: { status: 'ACTIVE' } });
                io.to(`ride_${rideId}`).emit('rideStarted', { rideId, driverId: user.id });
            }
        });
        socket.on('driverArrived', async (rideId) => {
            if (await userIsRideDriver(user.id, rideId)) {
                io.to(`ride_${rideId}`).emit('driverArrived', { rideId });
            }
        });
        socket.on('rideCompleted', async (rideId) => {
            if (!(await userIsRideDriver(user.id, rideId)))
                return;
            await db_1.default.$transaction(async (tx) => {
                await tx.ride.update({ where: { id: rideId }, data: { status: 'COMPLETED' } });
                await tx.booking.updateMany({
                    where: { rideId, status: 'CONFIRMED' },
                    data: { status: 'COMPLETED' },
                });
            });
            io.to(`ride_${rideId}`).emit('rideCompleted', { rideId });
        });
        socket.on('updateDriverStatus', async (status) => {
            if (user.role !== 'DRIVER')
                return;
            try {
                await db_1.default.driver.update({
                    where: { userId: user.id },
                    data: { status },
                });
                socket.broadcast.emit('driverStatusChanged', { driverId: user.id, status });
            }
            catch {
                /* passager sans profil conducteur */
            }
        });
        socket.on('disconnect', async () => {
            if (user.role !== 'DRIVER')
                return;
            try {
                const driver = await db_1.default.driver.findUnique({ where: { userId: user.id } });
                if (driver?.status === 'ON_RIDE')
                    return;
                await db_1.default.driver.update({
                    where: { userId: user.id },
                    data: { status: 'OFFLINE' },
                });
            }
            catch {
                /* ignore */
            }
        });
    });
};
exports.initializeSocket = initializeSocket;
//# sourceMappingURL=socket.js.map