"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const socket_1 = require("./sockets/socket");
const io_1 = require("./sockets/io");
const middlewares_1 = require("./middlewares");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', 1);
const httpServer = (0, http_1.createServer)(app);
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000,*')
    .split(',')
    .map((o) => o.trim());
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});
app.use((0, helmet_1.default)());
app.use(middlewares_1.securityHeaders);
app.use((0, cors_1.default)({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api', middlewares_1.apiLimiter, routes_1.default);
(0, io_1.setIO)(io);
(0, socket_1.initializeSocket)(io);
app.get('/health', (_req, res) => {
    res.json({ success: true, service: 'RideMada API', status: 'ok' });
});
app.use(middlewares_1.errorHandler);
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`RideMada Backend sur le port ${PORT}`);
    console.log('Socket.IO actif');
});
//# sourceMappingURL=server.js.map