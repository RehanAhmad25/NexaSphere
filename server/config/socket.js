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

// Tracks which socket IDs have joined which workspace rooms via join_room
const workspaceRoomMembers = new Map();

// Per-socket rate limiter for join_room events to prevent room enumeration
const joinRoomAttempts = new Map();
const MAX_JOIN_ROOM_ATTEMPTS = 20;
const JOIN_ROOM_WINDOW_MS = 60000;

// ==========================================
// WEBSOCKET BACKPRESSURE & THROTTLING CONFIG
// ==========================================
const MAX_PENDING_PACKETS = parseInt(process.env.WS_MAX_PENDING_PACKETS) || 100;
const SLOW_CONSUMER_TIMEOUT_MS = parseInt(process.env.WS_SLOW_CONSUMER_TIMEOUT_MS) || 5000;

const EVENT_POLICIES = {
  'cursor_moved': {
    throttleMs: 50,       // Max 20 updates per second
    coalesce: true,
  },
  'workspace_update': {
    throttleMs: 100,      // Max 10 updates per second
    coalesce: true,
  },
  'document_change': {
    throttleMs: 100,
    coalesce: true,
  },
  'admin:new-registration': {
    throttleMs: 200,      // Max 5 updates per second
    coalesce: true,
  },
  'registration-confirmed': {
    throttleMs: 500,
    coalesce: true,
  }
};

/**
 * Parse Socket.IO packet payload from raw Engine.IO transport string
 */
function parseSocketPacket(packetStr) {
  if (typeof packetStr !== 'string') return null;
  // Match Socket.IO message format: optional engine.io type (4) + socket.io message type (2) + JSON array
  // E.g. "42[...]" or "2[...]"
  const match = packetStr.match(/^(?:4)?2(\[.*\])$/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[1]);
    if (Array.isArray(arr) && arr.length >= 1) {
      return {
        event: arr[0],
        payload: arr[1]
      };
    }
  } catch (e) {
    // Silent fail for bad JSON
  }
  return null;
}

/**
 * Generate a unique qualifier to isolate event states (e.g. per-room or per-user)
 */
function getEventQualifier(event, payload) {
  if (!payload || typeof payload !== 'object') return '';
  let parts = [];
  if (payload.roomId) parts.push(`room:${payload.roomId}`);
  if (payload.teamRoomId) parts.push(`team:${payload.teamRoomId}`);
  if (payload.taskId) parts.push(`task:${payload.taskId}`);
  if (payload.socketId) parts.push(`socket:${payload.socketId}`);
  if (payload.userId) parts.push(`user:${payload.userId}`);
  return parts.join('|');
}

/**
 * Apply real-time websocket backpressure, slow consumer protection and emit throttling
 */
export function applyBackpressureProtection(socket) {
  if (!socket.conn) return;

  socket.data ||= {};
  if (socket.data.backpressureApplied) return;
  socket.data.backpressureApplied = true;

  socket.data.lastEmitTimes ||= {};
  socket.data.firstQueuedTime = null;

  // Listen to the transport drain event to clear the queued time
  const onDrain = () => {
    socket.data.firstQueuedTime = null;
  };
  socket.conn.on('drain', onDrain);
  socket.data.drainListener = onDrain;

  const origWrite = socket.conn.write;
  socket.conn.write = function (packet, options) {
    const pendingCount = socket.conn.writeBuffer ? socket.conn.writeBuffer.length : 0;

    // A. Bounded Websocket Buffering (Hard Queue Limits)
    if (pendingCount >= MAX_PENDING_PACKETS) {
      logger.warn('WebSocket backpressure limit exceeded. Force disconnecting slow consumer.', {
        socketId: socket.id,
        pendingCount,
        maxAllowed: MAX_PENDING_PACKETS
      });
      socket.disconnect(true);
      return;
    }

    // B. Slow Consumer Detection via time-stalled queues
    const now = Date.now();
    if (!socket.data.firstQueuedTime) {
      socket.data.firstQueuedTime = now;
    } else if (now - socket.data.firstQueuedTime > SLOW_CONSUMER_TIMEOUT_MS) {
      logger.warn('WebSocket consumer queue stalled. Force disconnecting slow consumer.', {
        socketId: socket.id,
        pendingCount,
        queuedDurationMs: now - socket.data.firstQueuedTime
      });
      socket.disconnect(true);
      return;
    }

    // C. Parser, Throttling & Coalescing
    const parsed = parseSocketPacket(packet);
    if (parsed) {
      const { event, payload } = parsed;
      const policy = EVENT_POLICIES[event];
      if (policy) {
        const lastEmit = socket.data.lastEmitTimes[event] || 0;

        if (policy.coalesce && now - lastEmit < policy.throttleMs) {
          const qualifier = getEventQualifier(event, payload);
          
          if (socket.conn.writeBuffer) {
            const existingIdx = socket.conn.writeBuffer.findIndex(item => {
              const itemParsed = parseSocketPacket(item.data);
              return itemParsed && itemParsed.event === event && getEventQualifier(event, itemParsed.payload) === qualifier;
            });

            if (existingIdx !== -1) {
              // Replace the old packet with the latest state (coalescing)
              socket.conn.writeBuffer[existingIdx].data = packet;
              return;
            }
          }
        }

        socket.data.lastEmitTimes[event] = now;
      }
    }

    return origWrite.call(socket.conn, packet, options);
  };
}

/**
 * Retrieve queue pressure and active websocket backpressure statistics
 */
export function getQueuePressureMetrics() {
  if (!io) return [];
  const metrics = [];
  for (const [id, socket] of io.sockets.sockets) {
    metrics.push({
      socketId: id,
      pendingPackets: socket.conn && socket.conn.writeBuffer ? socket.conn.writeBuffer.length : 0,
      firstQueuedTime: socket.data ? socket.data.firstQueuedTime : null,
      adminAuthenticated: !!socket.adminAuthenticated,
    });
  }
  return metrics;
}

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
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
  // Apply WebSocket backpressure, slow consumer protection and emit throttling
  applyBackpressureProtection(socket);

  logger.info('User connected', { socketId: socket.id, admin: !!socket.adminAuthenticated });

  // Auto-join authenticated admin sockets to admin room
  if (socket.adminAuthenticated) {
    socket.join('admin-room');
  }

  // Keep track of identify operations to rate limit floods per-socket (Max 3 events per lifetime)
  let identifyCount = 0;

  // Store connected user
  socket.on('user:identify', (userData) => {
    // 1. Enforce Per-Socket Identification Rate Limiting
    identifyCount++;
    if (identifyCount > 3) {
      logger.warn('Socket identification flood detected, forcing disconnect', { socketId: socket.id });
      socket.disconnect(true);
      return;
    }

    // 2. Defensive Payload Structure & Type Validation
    if (!userData || typeof userData !== 'object') {
      logger.warn('Invalid user identification payload type rejected', { socketId: socket.id });
      return;
    }

    const { userId, email } = userData;

    // Validate fields exist and are strictly primitive strings
    if (typeof userId !== 'string' || typeof email !== 'string') {
      logger.warn('User identification payload fields must be primitive strings', { socketId: socket.id });
      return;
    }

    // 3. Strict Size Bounds (128 char for IDs, 256 for Email)
    if (userId.length > 128 || email.length > 256) {
      logger.warn('Oversized user identification payload values rejected', { socketId: socket.id });
      return;
    }

    // 4. Safe Deep Copy (Persist sanitized primitives)
    connectedUsers.set(socket.id, {
      id: String(userId),
      email: String(email),
      socketId: String(socket.id),
      connectedAt: new Date(),
    });
    
    logger.info('User identified successfully', { userId: String(userId), socketId: socket.id });
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

    // 3. Per-socket rate limit to prevent room enumeration
    const now = Date.now();
    let attempts = joinRoomAttempts.get(socket.id);
    if (!attempts || now > attempts.resetAt) {
      attempts = { count: 0, resetAt: now + JOIN_ROOM_WINDOW_MS };
      joinRoomAttempts.set(socket.id, attempts);
    }
    attempts.count += 1;
    if (attempts.count > MAX_JOIN_ROOM_ATTEMPTS) {
      logger.warn('Socket join_room rate limit exceeded', { socketId: socket.id });
      return;
    }

    // 4. Track room membership for event relay authorization
    if (!workspaceRoomMembers.has(roomId)) {
      workspaceRoomMembers.set(roomId, new Set());
    }
    workspaceRoomMembers.get(roomId).add(socket.id);

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
    _removeWorkspaceMember(roomId, socket.id);
    socket.leave(roomId);
    logger.info('User left workspace room', { socketId: socket.id, roomId });
    socket.to(roomId).emit('user_left', { socketId: socket.id });
  });

  // Workspace synchronization events — only relay if sender is a room member
  socket.on('workspace_update', (data) => {
    const { roomId, ...payload } = data;
    if (roomId && _isWorkspaceMember(roomId, socket.id)) {
      socket.to(roomId).emit('workspace_update', payload);
    }
  });

  socket.on('document_change', (data) => {
    const { roomId, ...payload } = data;
    if (roomId && _isWorkspaceMember(roomId, socket.id)) {
      socket.to(roomId).emit('document_change', payload);
    }
  });

  socket.on('cursor_moved', (data) => {
    const { roomId, ...payload } = data;
    if (roomId && _isWorkspaceMember(roomId, socket.id)) {
      socket.to(roomId).emit('cursor_moved', { socketId: socket.id, ...payload });
    }
  });

  socket.on('typing_start', (data) => {
    const { roomId, ...payload } = data;
    if (roomId && _isWorkspaceMember(roomId, socket.id)) {
      socket.to(roomId).emit('typing_start', { socketId: socket.id, ...payload });
    }
  });

  socket.on('typing_stop', (data) => {
    const { roomId, ...payload } = data;
    if (roomId && _isWorkspaceMember(roomId, socket.id)) {
      socket.to(roomId).emit('typing_stop', { socketId: socket.id, ...payload });
    }
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
    _cleanupWorkspaceMembership(socket.id);
    joinRoomAttempts.delete(socket.id);
    if (socket.data) {
      socket.data.firstQueuedTime = null;
      socket.data.lastEmitTimes = null;
      if (socket.data.drainListener && socket.conn) {
        socket.conn.off('drain', socket.data.drainListener);
      }
    }
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

export function _clearWorkspaceRoomMembers() {
  workspaceRoomMembers.clear();
}

export function _clearJoinRoomAttempts() {
  joinRoomAttempts.clear();
}

function _isWorkspaceMember(roomId, socketId) {
  const members = workspaceRoomMembers.get(roomId);
  return members && members.has(socketId);
}

function _removeWorkspaceMember(roomId, socketId) {
  const members = workspaceRoomMembers.get(roomId);
  if (members) {
    members.delete(socketId);
    if (members.size === 0) workspaceRoomMembers.delete(roomId);
  }
}

function _cleanupWorkspaceMembership(socketId) {
  for (const [roomId, members] of workspaceRoomMembers) {
    if (members.has(socketId)) {
      members.delete(socketId);
      if (members.size === 0) workspaceRoomMembers.delete(roomId);
    }
  }
}

export default { initializeSocketIO, getIO, broadcastEvent, emitToRoom, emitToUser, _clearConnectedUsers, _clearWorkspaceRoomMembers, _clearJoinRoomAttempts, _onConnection, applyBackpressureProtection, getQueuePressureMetrics };
