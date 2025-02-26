import { create } from 'zustand';
import api from '../utils/axios';
import { Room, RoomState } from '../types/room';

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
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || '방 목록을 불러오는데 실패했습니다.' 
      });
    }
  },
  
  fetchUserRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/protected/rooms/me');
      set({ userRooms: response.data, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching user rooms:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || '내 채팅방 목록을 불러오는데 실패했습니다.' 
      });
    }
  },
  
  createRoom: async (name, description = '') => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/protected/rooms', { name, description });
      // 방 목록 새로고침
      await get().fetchRooms();
      await get().fetchUserRooms();
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Error creating room:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || '채팅방 생성에 실패했습니다.' 
      });
      return false;
    }
  },
  
  joinRoom: async (roomId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/protected/rooms/join', { roomId });
      // 사용자 방 목록 새로고침
      await get().fetchUserRooms();
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Error joining room:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || '채팅방 참여에 실패했습니다.' 
      });
      return false;
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
      return true;
    } catch (error: any) {
      console.error('Error leaving room:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || '채팅방 나가기에 실패했습니다.' 
      });
      return false;
    }
  },
  
  setCurrentRoom: (room) => {
    set({ currentRoom: room });
  },
  
  clearError: () => set({ error: null }),
})); 