import { create } from 'zustand';

export interface CursorPosition {
  x: number;
  y: number;
}

export interface UserPresence {
  socketId: string;
  user: any;
  cursor?: CursorPosition;
  isTyping?: boolean;
}

interface WorkspaceState {
  documentContent: string;
  users: Record<string, UserPresence>;
  status: 'Connected' | 'Reconnecting...' | 'Disconnected' | 'Syncing changes...';
  setDocumentContent: (content: string) => void;
  setStatus: (status: 'Connected' | 'Reconnecting...' | 'Disconnected' | 'Syncing changes...') => void;
  addUser: (socketId: string, user: any) => void;
  removeUser: (socketId: string) => void;
  updateUserCursor: (socketId: string, cursor: CursorPosition) => void;
  updateUserTyping: (socketId: string, isTyping: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  documentContent: '',
  users: {},
  status: 'Disconnected',
  
  setDocumentContent: (content) => set({ documentContent: content }),
  
  setStatus: (status) => set({ status }),
  
  addUser: (socketId, user) => set((state) => ({
    users: {
      ...state.users,
      [socketId]: { socketId, user }
    }
  })),
  
  removeUser: (socketId) => set((state) => {
    const newUsers = { ...state.users };
    delete newUsers[socketId];
    return { users: newUsers };
  }),
  
  updateUserCursor: (socketId, cursor) => set((state) => ({
    users: {
      ...state.users,
      [socketId]: { ...state.users[socketId], cursor }
    }
  })),
  
  updateUserTyping: (socketId, isTyping) => set((state) => ({
    users: {
      ...state.users,
      [socketId]: { ...state.users[socketId], isTyping }
    }
  })),
}));
