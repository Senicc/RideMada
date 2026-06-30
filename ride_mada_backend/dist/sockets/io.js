"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.setIO = void 0;
let ioInstance = null;
const setIO = (server) => {
    ioInstance = server;
};
exports.setIO = setIO;
const getIO = () => ioInstance;
exports.getIO = getIO;
//# sourceMappingURL=io.js.map