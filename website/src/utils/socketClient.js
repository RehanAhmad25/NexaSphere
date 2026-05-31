/**
 * Socket.IO Client Wrapper
 * Acts as a proxy to the shared singleton in src/services/socket.ts
 * to ensure exactly one WebSocket connection exists across the app.
 */

import { captureHandledException } from "./errorTracking";
import { getSocketPath, getSocketServerUrl } from "./runtimeConfig";
import { 
  initializeSocket as initCoreSocket, 
  getSocket as getCoreSocket, 
  disconnectSocket as disconnectCoreSocket 
} from "../services/socket";

let warnedMissingSocketConfig = false;
let hasAttachedGlobalListeners = false;

/**
 * Initialize Socket.IO client (returns the shared singleton)
 */
export function initializeSocket(serverUrl = getSocketServerUrl()) {
  const resolvedUrl = serverUrl || getSocketServerUrl();
  if (!resolvedUrl) {
    if (!warnedMissingSocketConfig) {
      warnedMissingSocketConfig = true;
      console.warn(
        "Socket.IO disabled: no socket server URL configured for this environment."
      );
    }
    return null;
  }

  // Use the shared service to initialize or get the singleton socket
  const socket = initCoreSocket(resolvedUrl);

  // Attach global user identification and error tracking exactly once
  if (!hasAttachedGlobalListeners) {
    hasAttachedGlobalListeners = true;

    socket.on("connect", () => {
      identifyUser();
    });

    socket.on("connect_error", (error) => {
      captureHandledException(error, "Socket.IO connect_error:");
    });

    socket.on("error", (error) => {
      captureHandledException(error, "Socket.IO error:");
    });

    socket.on("reconnect_failed", () => {
      captureHandledException(
        new Error("Socket.IO reconnect attempts exhausted"),
        "Socket.IO reconnect failed:"
      );
    });
  }

  return socket;
}

/**
 * Get socket instance
 */
export function getSocket() {
  const socket = getCoreSocket();
  if (!socket) {
    throw new Error("Socket.IO not initialized. Call initializeSocket first.");
  }
  return socket;
}

/**
 * Identify user to server
 */
export function identifyUser(userId, email) {
  let finalUserId = userId;
  let finalEmail = email;

  if (!finalUserId || !finalEmail) {
    const storedUser = localStorage.getItem("ns_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        finalUserId = user.id || user.userId;
        finalEmail = user.email;
      } catch {
        // Ignore malformed local user data.
      }
    }
  }

  const socket = getCoreSocket();
  if (socket && finalUserId) {
    socket.emit("user:identify", { userId: finalUserId, email: finalEmail });
  }
}

export function joinRoom(roomName) {
  const socket = getCoreSocket();
  if (socket) {
    socket.emit("room:join", roomName);
  }
}

export function leaveRoom(roomName) {
  const socket = getCoreSocket();
  if (socket) {
    socket.emit("room:leave", roomName);
  }
}

export function on(eventName, handler) {
  const socket = getCoreSocket();
  if (socket) {
    socket.on(eventName, handler);
  }
}

export function off(eventName, handler) {
  const socket = getCoreSocket();
  if (socket) {
    if (handler) {
      socket.off(eventName, handler);
    } else {
      socket.off(eventName);
    }
  }
}

export function emit(eventName, data) {
  const socket = getCoreSocket();
  if (socket) {
    socket.emit(eventName, data);
  }
}

export function disconnect() {
  hasAttachedGlobalListeners = false;
  disconnectCoreSocket();
}

export function destroySocket() {
  const socket = getCoreSocket();
  if (socket) {
    socket.removeAllListeners();
  }
  hasAttachedGlobalListeners = false;
  disconnectCoreSocket();
}

export function isConnected() {
  const socket = getCoreSocket();
  return socket?.connected || false;
}

export function getSocketId() {
  const socket = getCoreSocket();
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
