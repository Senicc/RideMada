import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import mainRoutes from './routes';
import { initializeSocket } from './sockets/socket';
import { errorHandler, apiLimiter, securityHeaders } from './middlewares';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000,*')
  .split(',')
  .map((o) => o.trim());

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(helmet());
app.use(securityHeaders);
app.use(
  cors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', apiLimiter, mainRoutes);

initializeSocket(io);

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'RideMada API', status: 'ok' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`RideMada Backend sur le port ${PORT}`);
  console.log('Socket.IO actif');
});
