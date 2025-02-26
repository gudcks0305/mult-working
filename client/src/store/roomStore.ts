import { create } from 'zustand';
import api from '../utils/axios';

export interface Room {
  id: number;
  name: string;
  description: string;
  createdBy: number;
  createdAt: string;
  userCount: number;
}

interface RoomState {
  rooms: Room[];
  userRooms: Room[];
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  
  fetchRooms: () => Promise<void>;
  fetchUserRooms: () => Promise<void>;
  createRoom: (name: string, description: string) => Promise<void>;
  joinRoom: (roomId: number) => Promise<void>;
  leaveRoom: (roomId: number) => Promise<void>;
  setCurrentRoom: (room: Room | null) => void;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  userRooms: [],
  currentRoom: null,
  isLoading: false,
  error: null,
  
  fetchRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/protected/rooms');
      set({ rooms: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching rooms:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to fetch rooms' 
      });
    }
  },
  
  fetchUserRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/protected/rooms/me');
      set({ userRooms: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching user rooms:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to fetch your rooms' 
      });
    }
  },
  
  createRoom: async (name, description) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/protected/rooms', { name, description });
      // 방 목록 새로고침
      await get().fetchRooms();
      await get().fetchUserRooms();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error creating room:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to create room' 
      });
    }
  },
  
  joinRoom: async (roomId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/protected/rooms/join', { roomId });
      // 사용자 방 목록 새로고침
      await get().fetchUserRooms();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error joining room:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to join room' 
      });
    }
  },
  
  leaveRoom: async (roomId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/protected/rooms/${roomId}/leave`);
      // 사용자 방 목록 새로고침
      await get().fetchUserRooms();
      // 현재 방이 나간 방이면 null로 설정
      const { currentRoom } = get();
      if (currentRoom && currentRoom.id === roomId) {
        set({ currentRoom: null });
      }
      set({ isLoading: false });
    } catch (error) {
      console.error('Error leaving room:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to leave room' 
      });
    }
  },
  
  setCurrentRoom: (room) => {
    set({ currentRoom: room });
  },
  
  clearError: () => set({ error: null }),
})); 