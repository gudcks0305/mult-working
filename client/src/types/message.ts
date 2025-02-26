export interface Message {
  id: number;
  content: string;
  userId: number;
  roomId: number;
  username?: string;
  createdAt: string;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  socket: WebSocket | null;
  connectionStatus: ConnectionStatus;
  reconnectAttempts: number;
  hasMore: boolean;
  page: number;
  
  fetchMessages: (roomId: number, page?: number, reset?: boolean) => Promise<void>;
  sendMessage: (content: string, roomId: number) => void;
  connectWebSocket: (roomId: number) => void;
  disconnectWebSocket: () => void;
  clearMessages: () => void;
  clearError: () => void;
} 