import { Server } from 'socket.io';

let ioInstance: Server | null = null;

export const setIO = (server: Server) => {
  ioInstance = server;
};

export const getIO = (): Server | null => ioInstance;
