import { create } from 'zustand';
import api from '../utils/axios';
import { useAuthStore } from './authStore';
import { Message, ConnectionStatus, MessageState } from '../types/message';
import { createWebSocketUrl, calculateReconnectDelay, shouldRetryConnection } from '../utils/websocket';
import { WEBSOCKET_RECONNECT_MAX_ATTEMPTS } from '../constants';

// 한 페이지당 메시지 수
const PAGE_SIZE = 20;

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  socket: null,
  connectionStatus: 'disconnected',
  reconnectAttempts: 0,
  hasMore: true,
  page: 1,
  
  fetchMessages: async (roomId, page = 1, reset = false) => {
    if (page === 1 || reset) {
      set({ isLoading: true });
    }
    
    set({ error: null });
    
    try {
      const response = await api.get(`/protected/messages/room/${roomId}`, {
        params: { page, limit: PAGE_SIZE }
      });
      
      const newMessages = response.data.messages || response.data;
      
      // 정렬: 오래된 메시지가 위에 오도록
      const sortedMessages = newMessages.sort((a: Message, b: Message) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      // 첫 페이지이거나 리셋인 경우 메시지 배열 교체, 아니면 이전 메시지에 추가
      if (page === 1 || reset) {
        set({ 
          messages: sortedMessages,
          isLoading: false,
          hasMore: sortedMessages.length === PAGE_SIZE,
          page: 1
        });
      } else {
        set(state => ({ 
          messages: [...sortedMessages, ...state.messages],
          isLoading: false,
          hasMore: sortedMessages.length === PAGE_SIZE,
          page
        }));
      }
    } catch (error: any) {
      console.error('Fetch messages error:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || '메시지를 불러오는데 실패했습니다.' 
      });
    }
  },
  
  sendMessage: async (content, roomId) => {
    const { socket, connectionStatus } = get();
    
    // 웹소켓 연결이 활성화되어 있는 경우
    if (socket && connectionStatus === 'connected') {
      // 웹소켓으로 메시지 전송
      socket.send(JSON.stringify({
        type: 'send_message',
        payload: { content, roomId }
      }));
    } else {
      // 웹소켓이 연결되지 않은 경우 오류 표시
      set({ error: '메시지를 보내려면 연결이 필요합니다. 재연결을 시도해주세요.' });
    }
  },
  
  connectWebSocket: (roomId) => {
    // 기존 연결 종료
    get().disconnectWebSocket();
    
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    // 연결 상태 업데이트
    set({ connectionStatus: 'connecting', error: null });
    
    // 웹소켓 URL 생성
    const wsUrl = createWebSocketUrl(token);
    console.log('Connecting to WebSocket URL:', wsUrl);
    
    // 웹소켓 연결
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      
      // 연결 성공 시 상태 업데이트
      set({ 
        connectionStatus: 'connected', 
        reconnectAttempts: 0,
        error: null
      });
      
      // 채팅방 참여 메시지 전송
      socket.send(JSON.stringify({
        type: 'join_room',
        payload: { roomId }
      }));
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'new_message') {
          // 새 메시지 수신 시 메시지 목록에 추가
          const newMessage = data.payload;
          set(state => ({
            messages: [...state.messages, newMessage]
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = (event) => {
      console.log('WebSocket closed:', event);
      
      // 정상적인 종료가 아닌 경우 재연결 시도
      if (!event.wasClean) {
        const { reconnectAttempts } = get();
        
        // 최대 재시도 횟수 이내인 경우 재연결 시도
        if (shouldRetryConnection(reconnectAttempts)) {
          set({ 
            connectionStatus: 'reconnecting',
            reconnectAttempts: reconnectAttempts + 1,
            error: '연결이 끊어졌습니다. 재연결 중...'
          });
          
          // 지수 백오프로 재연결 시도
          const timeout = calculateReconnectDelay(reconnectAttempts);
          console.log(`Attempting to reconnect in ${timeout/1000} seconds...`);
          
          setTimeout(() => {
            if (get().connectionStatus === 'reconnecting') {
              get().connectWebSocket(roomId);
            }
          }, timeout);
        } else {
          set({ 
            connectionStatus: 'disconnected',
            error: `연결 시도 횟수(${WEBSOCKET_RECONNECT_MAX_ATTEMPTS}회)를 초과했습니다. 수동으로 재연결해주세요.` 
          });
        }
      } else {
        // 정상적인 종료인 경우
        set({ connectionStatus: 'disconnected' });
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      
      // 오류 세부 정보 로깅 (가능한 경우)
      if (error instanceof Event && error.target) {
        const target = error.target as WebSocket;
        console.error('WebSocket error details:', {
          readyState: target.readyState,
          url: target.url
        });
      }
      
      set({ 
        connectionStatus: 'disconnected', 
        error: '웹소켓 연결 오류가 발생했습니다. 다시 시도해주세요.' 
      });
    };
    
    set({ socket });
  },
  
  disconnectWebSocket: () => {
    const { socket } = get();
    if (socket) {
      // 정상적인 종료 표시
      set({ connectionStatus: 'disconnected' });
      socket.close();
      set({ socket: null });
    }
  },
  
  clearMessages: () => set({ messages: [], hasMore: true, page: 1 }),
  
  clearError: () => set({ error: null }),
})); 