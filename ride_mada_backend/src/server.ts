import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import mainRoutes from './routes';
import { initializeSocket } from './sockets/socket';
import { errorHandler } from './middlewares';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(express.json());
app.use('/api', mainRoutes);

// Initialisation Socket.IO
initializeSocket(io);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 RideMada Backend lancé sur le port ${PORT}`);
  console.log(`📡 Socket.IO prêt pour tracking & chat temps réel`);
});