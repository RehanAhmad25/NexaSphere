import { io, Socket } from 'socket.io-client';

// Keep a singleton instance
let socketInstance: Socket | null = null;

export const initializeSocket = (url: string = import.meta.env.VITE_API_URL || 'http://localhost:5000'): Socket => {
  if (!socketInstance) {
    socketInstance = io(url, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      transports: ['websocket'],
    });
  }
  return socketInstance;
};

export const getSocket = (): Socket => {
  if (!socketInstance) {
    return initializeSocket();
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
