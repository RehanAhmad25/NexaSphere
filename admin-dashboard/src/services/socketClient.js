/**
 * Socket.IO Client for Admin Dashboard
 * Emits content:updated events to the Node.js server when admin
 * creates, updates, or deletes events, activity events, or team members.
 * Falls back gracefully when the socket server is unreachable.
 */

import io from 'socket.io-client';

let socket = null;

const SOCKET_SERVER =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE?.replace(/\/api\/?.*$/, '') ||
  'http://localhost:8787';

/**
 * Initialize socket connection — called once on admin dashboard mount.
 * Returns the socket instance or null if the server is unreachable.
 */
export function initAdminSocket() {
  if (socket?.connected) return socket;

  try {
    socket = io(SOCKET_SERVER, {
      path: import.meta.env.VITE_SOCKET_PATH || '/socket.io',
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 8000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      timeout: 5000,
      autoConnect: false,
    });

    socket.on('connect', () => {
      console.log('[Admin Socket] Connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Admin Socket] Connection failed:', err.message);
    });

    socket.on('reconnect_failed', () => {
      console.warn('[Admin Socket] Reconnection failed — admin will work without real-time sync.');
    });

    socket.connect();
    return socket;
  } catch (err) {
    console.warn('[Admin Socket] Init failed:', err.message);
    return null;
  }
}

/**
 * Broadcast a content update to all connected website clients.
 * @param {"events"|"team"|"activities"} type — which content changed
 */
export function broadcastContentUpdate(type) {
  if (!socket?.connected) return;
  socket.emit('content:updated', { type });
}

/**
 * Get the current socket instance (may be null).
 */
export function getSocket() {
  return socket;
}
