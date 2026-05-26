/**
 * Socket.IO React Hook
 * Provides reactive access to Socket.IO connections, room subscriptions, and event emitters
 */

import { useEffect, useState, useCallback } from 'react';
import socketClient from '../utils/socketClient';
import { getSocketServerUrl } from '../utils/runtimeConfig';

export function useSocket(serverUrl) {
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    // Initialize socket connection if not already done
    const base = serverUrl || getSocketServerUrl();
    const socket = socketClient.initializeSocket(base);
    if (!socket) {
      setConnected(false);
      setSocketId(null);
      return undefined;
    }

    const onConnect = () => {
      if (!isMounted) return;
      setConnected(true);
      setSocketId(socket.id);
    };

    const onDisconnect = () => {
      if (!isMounted) return;
      setConnected(false);
      setSocketId(null);
    };

    // Listen to standard connection events using socket directly
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Sync initial state
    setConnected(socket.connected || false);
    setSocketId(socket.id || null);

    return () => {
      isMounted = false;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [serverUrl]);


  /**
   * Identify authenticated user to the WebSocket room
   */
  const identify = useCallback((userId, email) => {
    socketClient.identifyUser(userId, email);
  }, []);

  /**
   * Dynamically subscribe to a WebSocket room
   */
  const join = useCallback((roomName) => {
    socketClient.joinRoom(roomName);
  }, []);

  /**
   * Leave a WebSocket room
   */
  const leave = useCallback((roomName) => {
    socketClient.leaveRoom(roomName);
  }, []);

  /**
   * Register dynamic listener for a custom socket event
   */
  const on = useCallback((eventName, handler) => {
    socketClient.on(eventName, handler);
    return () => {
      socketClient.off(eventName, handler);
    };
  }, []);

  /**
   * Unregister dynamic listener for a custom socket event
   */
  const off = useCallback((eventName, handler) => {
    socketClient.off(eventName, handler);
  }, []);


  /**
   * Emit event to the socket server
   */
  const emit = useCallback((eventName, data) => {
    socketClient.emit(eventName, data);
  }, []);

  return {
    connected,
    socketId,
    identify,
    join,
    leave,
    on,
    off,
    emit,
  };
}

export default useSocket;
