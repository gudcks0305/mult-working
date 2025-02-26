export interface Message {
  id: number;
  content: string;
  userId: number;
  username: string;
  roomId: number;
  createdAt: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  socket: WebSocket | null;
  connectionStatus: ConnectionStatus;
  reconnectAttempts: number;
  
  fetchMessages: (roomId: number) => Promise<void>;
  sendMessage: (content: string, roomId: number) => Promise<void>;
  connectWebSocket: (roomId: number) => void;
  disconnectWebSocket: () => void;
  clearMessages: () => void;
  clearError: () => void;
} 