import { useEffect, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';

type SocketEventCallback = (...args: any[]) => void;

/**
 * Hook to strictly manage socket event listeners to prevent memory leaks
 */
export function useSocket(event: string, callback: SocketEventCallback) {
  const { socket } = useSocketContext();
  const savedCallback = useRef<SocketEventCallback>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the listener
  useEffect(() => {
    if (!socket) return;

    const listener = (...args: any[]) => {
      if (savedCallback.current) {
        savedCallback.current(...args);
      }
    };

    socket.on(event, listener);

    return () => {
      socket.off(event, listener);
    };
  }, [event, socket]);

  return socket;
}
