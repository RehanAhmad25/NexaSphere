/**
 * Socket.IO Client
 * Handles WebSocket connections and real-time updates
 */

import io from 'socket.io-client';
import { captureHandledException } from './errorTracking';
import { getSocketPath, getSocketServerUrl } from './runtimeConfig';

let socket = null;
let eventHandlers = {};
let currentSocketUrl = '';
let warnedMissingSocketConfig = false;

/**
 * Initialize Socket.IO client
 */
export function initializeSocket(serverUrl = getSocketServerUrl()) {
  const resolvedUrl = serverUrl || getSocketServerUrl();
  if (!resolvedUrl) {
    if (!warnedMissingSocketConfig) {
      warnedMissingSocketConfig = true;
      console.warn('Socket.IO disabled: no socket server URL configured for this environment.');
    }
    return null;
  }

  if (socket && currentSocketUrl === resolvedUrl) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  currentSocketUrl = resolvedUrl;
  socket = io(resolvedUrl, {
    path: getSocketPath(),
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 8,
    transports: ['websocket', 'polling'],
    timeout: 5000,
  });

  // Global event handlers - connection lifecycle monitoring
  socket.on('connect', () => {
    identifyUser(); // try to identify if user info is available locally
  });

  socket.on('reconnect_failed', () => {
    console.error('[Socket.IO] Reconnection failed');
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket.IO] Connection Error:', error);
    captureHandledException(error, 'Socket.IO connect_error:');
  });

  socket.on('error', (error) => {
    console.error('[Socket.IO] Error:', error);
    captureHandledException(error, 'Socket.IO error:');
  });

  socket.on('connect_error', (error) => {
    captureHandledException(error, 'Socket.IO connection error:');
  });

  socket.on('reconnect_failed', () => {
    captureHandledException(new Error('Socket.IO reconnect attempts exhausted'), 'Socket.IO reconnect failed:');
  });

  // Setup custom event listeners
  setupEventListeners();

  return socket;
}

/**
 * Get socket instance
 */
export function getSocket() {
  if (!socket) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return socket;
}

/**
 * Identify user to server
 */
export function identifyUser(userId, email) {
  // If not explicitly passed, try to fetch from localStorage
  if (!userId || !email) {
    const storedUser = localStorage.getItem('ns_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        userId = user.id || user.userId;
        email = user.email;
      } catch (e) {
        // ignore
      }
    }
  }

  if (socket && userId) {
    socket.emit('user:identify', { userId, email });
  }
}

/**
 * Join notification room
 */
export function joinRoom(roomName) {
  if (socket) {
    socket.emit('room:join', roomName);
  }
}

/**
 * Leave room
 */
export function leaveRoom(roomName) {
  if (socket) {
    socket.emit('room:leave', roomName);
  }
}

/**
 * Register event handler
 */
export function on(eventName, handler) {
  if (socket) {
    socket.on(eventName, handler);
  }
}

/**
 * Remove event handler
 */
export function off(eventName, handler) {
  if (socket) {
    if (handler) {
      socket.off(eventName, handler);
    } else {
      socket.off(eventName); // Fallback but not recommended
    }
  }
}

/**
 * Emit custom event to server
 */
export function emit(eventName, data) {
  if (socket) {
    socket.emit(eventName, data);
  }
}

/**
 * Disconnect socket gracefully (Use mainly for testing or explicit manual disconnect)
 */
export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentSocketUrl = '';
  }
}

/**
 * Completely destroy socket and all listeners (Use on user logout)
 */
export function destroySocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get socket status
 */
export function isConnected() {
  return socket?.connected || false;
}

/**
 * Get socket id
 */
export function getSocketId() {
  return socket?.id || null;
}

export default {
  initializeSocket,
  getSocket,
  identifyUser,
  joinRoom,
  leaveRoom,
  on,
  off,
  emit,
  disconnect,
  destroySocket,
  isConnected,
  getSocketId,
};
