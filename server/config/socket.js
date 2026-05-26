/**
 * Socket.IO Configuration
 * Handles WebSocket connections for real-time updates
 */

import { Server } from 'socket.io';
import logger from '../utils/logger.js';
import { getAdminSession } from '../repositories/adminSessionsRepository.js';

let io = null;
const connectedUsers = new Map();
const rooms = {
  admin: 'admin-room',
  notifications: 'notifications-room',
  events: 'events-room',
};
const PROTECTED_ROOMS = ['admin-room'];

/**
 * Parse Bearer token from auth header
 */
function parseBearer(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice(7).trim();
}

/**
 * Initialize Socket.IO
 * @param {Object} httpServer - HTTP server instance
 */
export function initializeSocketIO(httpServer) {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
    : [process.env.FRONTEND_URL || 'http://localhost:5173'];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Connection auth middleware — checks handshake auth token
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || parseBearer(socket.handshake.headers?.authorization);
    if (token) {
      try {
        const session = await getAdminSession(token);
        if (session) {
          socket.adminSession = session;
          socket.adminAuthenticated = true;
        }
      } catch {
        // Auth check is best-effort at connection time
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    _onConnection(socket);
  });

  return io;
}

/**
 * Socket.IO connection event handler (exposed for security validation)
 * @param {Object} socket - Socket.io socket instance
 */
export function _onConnection(socket) {
  logger.info('User connected', { socketId: socket.id, admin: !!socket.adminAuthenticated });

  // Auto-join authenticated admin sockets to admin room
  if (socket.adminAuthenticated) {
    socket.join('admin-room');
  }

  // Store connected user
  socket.on('user:identify', (userData) => {
    connectedUsers.set(socket.id, {
      id: userData.userId,
      email: userData.email,
      socketId: socket.id,
      connectedAt: new Date(),
    });
    logger.info('User identified', { userId: userData.userId, socketId: socket.id });
  });

  // Approved public-facing rooms that standard users can join
  const ALLOWED_PUBLIC_ROOMS = ['notifications-room', 'events-room', 'admin-room'];
  const MAX_ROOMS_PER_SOCKET = 10;

  // Join notification room
  socket.on('room:join', (roomName) => {
    // 1. Primitive Type Validation
    if (typeof roomName !== 'string') {
      logger.warn('Socket room:join payload must be a string', { socketId: socket.id });
      return;
    }

    // 2. Strict Allowlist Match
    if (!ALLOWED_PUBLIC_ROOMS.includes(roomName)) {
      logger.warn('Unapproved room:join attempt rejected', { socketId: socket.id, room: roomName });
      return socket.emit('room:join:error', { error: 'Invalid or unauthorized room name' });
    }

    // 3. Authorization Check for Protected Rooms
    if (PROTECTED_ROOMS.includes(roomName) && !socket.adminAuthenticated) {
      logger.warn('Unauthorized room join attempt', { socketId: socket.id, room: roomName });
      return socket.emit('room:join:error', { error: 'Authentication required to join this room' });
    }

    // 4. Per-Socket Bounded Active Rooms Cap (Set size check)
    const joinedCount = socket.rooms ? (socket.rooms.size - 1) : 0;
    if (joinedCount >= MAX_ROOMS_PER_SOCKET) {
      logger.warn('Socket joined rooms limit exceeded', { socketId: socket.id });
      return socket.emit('room:join:error', { error: 'Maximum room subscription limit reached' });
    }

    socket.join(roomName);
    logger.info('User joined room', { socketId: socket.id, room: roomName });
  });

  // Leave room
  socket.on('room:leave', (roomName) => {
    if (typeof roomName !== 'string') return;
    socket.leave(roomName);
    logger.info('User left room', { socketId: socket.id, room: roomName });
  });

  // Join workspace room (Issue #205)
  socket.on('join_room', (roomId, user) => {
    // 1. Primitive Type & Structure Regex Validation (UUID/ObjectId/Workspace Name)
    if (typeof roomId !== 'string' || !/^[a-zA-Z0-9\-_]{1,100}$/.test(roomId)) {
      logger.warn('Malformed workspace roomId join attempt rejected', { socketId: socket.id, roomId });
      return;
    }

    // 2. Per-Socket Bounded Active Rooms Cap
    const joinedCount = socket.rooms ? (socket.rooms.size - 1) : 0;
    if (joinedCount >= MAX_ROOMS_PER_SOCKET) {
      logger.warn('Socket workspace joined rooms limit exceeded', { socketId: socket.id });
      return;
    }

    socket.join(roomId);
    logger.info('User joined workspace room', { socketId: socket.id, roomId });

    // Sanitize user details to prevent reference leaks / massive nested objects
    const sanitizedUser = user && typeof user === 'object' ? {
      name: typeof user.name === 'string' ? user.name.slice(0, 100) : 'Anonymous',
      email: typeof user.email === 'string' ? user.email.slice(0, 150) : '',
    } : {};

    socket.to(roomId).emit('user_joined', { socketId: socket.id, user: sanitizedUser, timestamp: Date.now() });
  });

  // Leave workspace room
  socket.on('leave_room', (roomId) => {
    if (typeof roomId !== 'string') return;
    socket.leave(roomId);
    logger.info('User left workspace room', { socketId: socket.id, roomId });
    socket.to(roomId).emit('user_left', { socketId: socket.id });
  });

  // Workspace synchronization events
  socket.on('workspace_update', (data) => {
    const { roomId, ...payload } = data;
    if (roomId) socket.to(roomId).emit('workspace_update', payload);
  });

  socket.on('document_change', (data) => {
    const { roomId, ...payload } = data;
    if (roomId) socket.to(roomId).emit('document_change', payload);
  });

  socket.on('cursor_moved', (data) => {
    const { roomId, ...payload } = data;
    if (roomId) socket.to(roomId).emit('cursor_moved', { socketId: socket.id, ...payload });
  });

  socket.on('typing_start', (data) => {
    const { roomId, ...payload } = data;
    if (roomId) socket.to(roomId).emit('typing_start', { socketId: socket.id, ...payload });
  });

  socket.on('typing_stop', (data) => {
    const { roomId, ...payload } = data;
    if (roomId) socket.to(roomId).emit('typing_stop', { socketId: socket.id, ...payload });
  });

  // Authenticate socket for admin rooms using admin token
  socket.on('admin:authenticate', async ({ token } = {}) => {
    if (!token) {
      return socket.emit('admin:authenticated', { success: false, error: 'Token is required' });
    }
    try {
      const session = await getAdminSession(token);
      if (!session) {
        return socket.emit('admin:authenticated', { success: false, error: 'Invalid or expired token' });
      }
      socket.adminSession = session;
      socket.adminAuthenticated = true;
      socket.join('admin-room');
      logger.info('Admin authenticated via socket event', { socketId: socket.id, username: session.username });
      socket.emit('admin:authenticated', { success: true });
    } catch (e) {
      logger.error('Admin authentication error', { error: e.message, socketId: socket.id });
      socket.emit('admin:authenticated', { success: false, error: 'Authentication failed' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    logger.info('User disconnected', { socketId: socket.id });
  });

  // Error handling
  socket.on('error', (error) => {
    logger.error('Socket error', { error: error.message, socketId: socket.id });
  });
}

/**
 * Get Socket.IO instance
 */
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

/**
 * Emit event to all connected clients
 */
export function broadcastEvent(eventName, data) {
  if (!io) return;
  io.emit(eventName, data);
  logger.debug('Broadcast event', { event: eventName });
}

/**
 * Emit event to specific room
 */
export function emitToRoom(roomName, eventName, data) {
  if (!io) return;
  io.to(roomName).emit(eventName, data);
  logger.debug('Emit to room', { room: roomName, event: eventName });
}

/**
 * Emit event to specific user
 */
export function emitToUser(userId, eventName, data) {
  if (!io) return;
  const user = Array.from(connectedUsers.values()).find(u => u.id === userId);
  if (user) {
    io.to(user.socketId).emit(eventName, data);
    logger.debug('Emit to user', { userId, event: eventName });
  }
}

/**
 * Get connected users count
 */
export function getConnectedUsersCount() {
  return connectedUsers.size;
}

/**
 * Get all connected users
 */
export function getConnectedUsers() {
  return Array.from(connectedUsers.values());
}

/**
 * Get room reference
 */
export function getRoom(roomType) {
  return rooms[roomType] || null;
}

export function _clearConnectedUsers() {
  connectedUsers.clear();
}

export default { initializeSocketIO, getIO, broadcastEvent, emitToRoom, emitToUser, _clearConnectedUsers, _onConnection };
