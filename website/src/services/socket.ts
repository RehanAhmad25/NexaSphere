import { io, Socket } from 'socket.io-client';

// Keep a singleton instance
let socketInstance: Socket | null = null;
let connectionUrl: string = '';

export const initializeSocket = (url: string = import.meta.env.VITE_API_URL || 'http://localhost:5000'): Socket => {
  if (!socketInstance || (connectionUrl && connectionUrl !== url)) {
    if (socketInstance) {
      console.log(`[Socket.IO] Disconnecting existing socket due to URL change.`);
      socketInstance.disconnect();
    }
    
    console.log(`[Socket.IO] Initializing new socket connection to: ${url}`);
    connectionUrl = url;
    
    socketInstance = io(url, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log(`[Socket.IO] Connected with ID: ${socketInstance?.id}`);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Disconnected. Reason: ${reason}`);
    });

    socketInstance.on('connect_error', (err) => {
      console.error(`[Socket.IO] Connection Error:`, err);
    });

    // Monkey-patch on/off for observability
    const originalOn = socketInstance.on.bind(socketInstance);
    socketInstance.on = (event: string, listener: any) => {
      if (import.meta.env.DEV && event !== 'connect' && event !== 'disconnect') {
        console.log(`[Socket.IO] Listener registered for event: ${event}`);
      }
      return originalOn(event, listener);
    };

    const originalOff = socketInstance.off.bind(socketInstance);
    socketInstance.off = (event: string, listener?: any) => {
      if (import.meta.env.DEV && event !== 'connect' && event !== 'disconnect') {
        console.log(`[Socket.IO] Listener removed for event: ${event}`);
      }
      return originalOff(event, listener);
    };
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
    console.log(`[Socket.IO] Manually destroying socket instance.`);
    socketInstance.disconnect();
    socketInstance = null;
    connectionUrl = '';
  }
};
