"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const socket_1 = require("./sockets/socket");
const middlewares_1 = require("./middlewares");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// Middlewares
app.use(express_1.default.json());
app.use('/api', routes_1.default);
// Initialisation Socket.IO
(0, socket_1.initializeSocket)(io);
app.use(middlewares_1.errorHandler);
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 RideMada Backend lancé sur le port ${PORT}`);
    console.log(`📡 Socket.IO prêt pour tracking & chat temps réel`);
});
//# sourceMappingURL=server.js.map