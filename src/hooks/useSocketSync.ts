import { useEffect, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useSocket } from './useSocket';
import { useWorkspaceStore } from '../store/workspaceStore';

export function useSocketSync(roomId: string, user: any) {
  const { socket, isConnected } = useSocketContext();
  const setDocumentContent = useWorkspaceStore((state) => state.setDocumentContent);
  const setStatus = useWorkspaceStore((state) => state.setStatus);
  const addUser = useWorkspaceStore((state) => state.addUser);
  const removeUser = useWorkspaceStore((state) => state.removeUser);
  const updateUserCursor = useWorkspaceStore((state) => state.updateUserCursor);
  const updateUserTyping = useWorkspaceStore((state) => state.updateUserTyping);

  // Manage connection status UI
  useEffect(() => {
    if (isConnected) {
      setStatus('Connected');
      socket?.emit('join_room', roomId, user);
    } else {
      setStatus('Disconnected');
    }

    return () => {
      if (isConnected) {
        socket?.emit('leave_room', roomId);
      }
    };
  }, [isConnected, roomId, socket, setStatus, user]);

  useSocket('connect_error', () => {
    setStatus('Reconnecting...');
  });

  // Sync events
  useSocket('document_change', (payload) => {
    setDocumentContent(payload.content);
  });

  useSocket('user_joined', (payload) => {
    addUser(payload.socketId, payload.user);
  });

  useSocket('user_left', (payload) => {
    removeUser(payload.socketId);
  });

  useSocket('cursor_moved', (payload) => {
    updateUserCursor(payload.socketId, payload.cursor);
  });

  useSocket('typing_start', (payload) => {
    updateUserTyping(payload.socketId, true);
  });

  useSocket('typing_stop', (payload) => {
    updateUserTyping(payload.socketId, false);
  });

  // Debounced/Throttled emitters
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCursorEmitRef = useRef<number>(0);

  const emitDocumentChange = (content: string) => {
    if (!socket) return;
    setStatus('Syncing changes...');
    socket.emit('document_change', { roomId, content });
    setTimeout(() => {
      if (useWorkspaceStore.getState().status === 'Syncing changes...') {
        setStatus('Connected');
      }
    }, 500);
  };

  const emitCursorMove = (cursor: { x: number; y: number }) => {
    if (!socket) return;
    const now = Date.now();
    // Throttle cursor movement to 50ms (20fps)
    if (now - lastCursorEmitRef.current > 50) {
      socket.emit('cursor_moved', { roomId, cursor });
      lastCursorEmitRef.current = now;
    }
  };

  const emitTyping = () => {
    if (!socket) return;
    socket.emit('typing_start', { roomId });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Auto-stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { roomId });
    }, 1000);
  };

  return {
    emitDocumentChange,
    emitCursorMove,
    emitTyping,
  };
}
