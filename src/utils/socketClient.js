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
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 8,
    transports: ['websocket', 'polling'],
    timeout: 5000,
  });

  // Global event handlers
  socket.on('connect', () => {
    identifyUser();
  });

  socket.on('disconnect', (_reason) => {
    // Disconnect handled silently; reconnection is automatic
  });

  socket.on('error', (error) => {
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
  if (socket) {
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
 * Setup event listeners for real-time updates
 */
function setupEventListeners() {
  if (!socket) return;

  // Registration confirmed
  socket.on('registration-confirmed', (data) => {
    if (eventHandlers.registrationConfirmed) {
      eventHandlers.registrationConfirmed(data);
    }
  });

  // Waitlist promotion
  socket.on('waitlist-promotion', (data) => {
    if (eventHandlers.waitlistPromotion) {
      eventHandlers.waitlistPromotion(data);
    }
  });

  // Event reminder
  socket.on('event-reminder', (data) => {
    if (eventHandlers.eventReminder) {
      eventHandlers.eventReminder(data);
    }
  });

  // Attendance marked
  socket.on('attendance-marked', (data) => {
    if (eventHandlers.attendanceMarked) {
      eventHandlers.attendanceMarked(data);
    }
  });

  // Admin notifications
  socket.on('admin:new-registration', (data) => {
    if (eventHandlers.adminNewRegistration) {
      eventHandlers.adminNewRegistration(data);
    }
  });

  socket.on('admin:waitlist-promotion', (data) => {
    if (eventHandlers.adminWaitlistPromotion) {
      eventHandlers.adminWaitlistPromotion(data);
    }
  });

  socket.on('admin:attendance-marked', (data) => {
    if (eventHandlers.adminAttendanceMarked) {
      eventHandlers.adminAttendanceMarked(data);
    }
  });
}

/**
 * Register event handler
 */
export function on(eventName, handler) {
  eventHandlers[eventName] = handler;
}

/**
 * Remove event handler
 */
export function off(eventName) {
  delete eventHandlers[eventName];
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
 * Disconnect socket
 */
export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentSocketUrl = '';
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
  isConnected,
  getSocketId,
};
