export interface Room {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  ownerId: number;
}

export interface RoomState {
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