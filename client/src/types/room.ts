export interface Room {
  id: number;
  name: string;
  description?: string;
  userCount?: number;
  createdAt: string;
  createdBy?: number;
  ownerId?: number;
}

export interface RoomState {
  rooms: Room[];
  userRooms: Room[];
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  
  fetchRooms: () => Promise<void>;
  fetchUserRooms: () => Promise<void>;
  createRoom: (name: string, description?: string) => Promise<boolean>;
  joinRoom: (roomId: number) => Promise<boolean>;
  leaveRoom: (roomId: number) => Promise<boolean>;
  setCurrentRoom: (room: Room | null) => void;
  clearError: () => void;
} 