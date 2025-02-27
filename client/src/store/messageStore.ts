import { create } from 'zustand';
import { Message, MessageState } from '../types/message';
import api from '../utils/axios';

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
  
  connectWebSocket: (roomId: number) => {
    const { socket, connectionStatus } = get();
    
    // 이미 연결되어 있거나 연결 중이면 리턴
    if (socket && (connectionStatus === 'connected' || connectionStatus === 'connecting')) {
      console.log('WebSocket already connected or connecting');
      
      // 이미 연결된 상태에서 새로운 방에 들어가는 경우 join_room 메시지만 전송
      if (connectionStatus === 'connected') {
        socket.send(JSON.stringify({
          type: 'join_room', 
          payload: { roomId }
        }));
      }
      return;
    }
    
    try {
      // 현재 토큰 가져오기
      const token = localStorage.getItem('token');
      if (!token) {
        set({ connectionStatus: 'disconnected', error: '인증이 필요합니다' });
        return;
      }
      
      // WebSocket URL 확인 - 백엔드 주소와 일치해야 함
      // const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsProtocol = 'wss:'
      // 개발 환경에서는 다른 포트를 사용할 수 있으므로 조건부 URL 생성
      const baseUrl = import.meta.env.DEV ? 'localhost:8080' : window.location.host;
      const wsUrl = `${wsProtocol}//${baseUrl}/api/ws?token=${token}`;
      
      console.log('Connecting to WebSocket URL:', wsUrl);
      const newSocket = new WebSocket(wsUrl);
      
      // 연결 상태 설정
      set({ socket: newSocket, connectionStatus: 'connecting' });
      
      // WebSocket 이벤트 처리
      newSocket.onopen = () => {
        console.log('WebSocket connected');
        set({ connectionStatus: 'connected', error: null });
        
        // 채팅방 참여 메시지 전송
        newSocket.send(JSON.stringify({
          type: 'join_room',
          payload: { roomId }
        }));
      };
      
      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'new_message') {
            // 새 메시지 수신 시 메시지 목록에 추가
            const newMessage = data.payload;
            set(state => ({
              messages: [...state.messages, newMessage]
            }));
          } else if (data.type === 'user_joined') {
            // 사용자 참여 처리
            console.log('User joined:', data.payload);
          } else if (data.type === 'user_left') {
            // 사용자 퇴장 처리
            console.log('User left:', data.payload);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
      
      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        set({ connectionStatus: 'disconnected', error: '연결 오류가 발생했습니다' });
      };
      
      newSocket.onclose = (event) => {
        console.log('WebSocket closed:', event);
        
        // 비정상적 종료시 재연결 시도
        if (!event.wasClean) {
          set({ 
            connectionStatus: 'disconnected',
            error: '연결이 끊어졌습니다. 재연결을 시도해주세요.'
          });
          
          // 자동 재연결 시도 (선택적)
          setTimeout(() => {
            if (get().connectionStatus === 'disconnected') {
              console.log('Attempting to reconnect...');
              get().connectWebSocket(roomId);
            }
          }, 3000);
        } else {
          set({ connectionStatus: 'disconnected' });
        }
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      set({ connectionStatus: 'disconnected', error: '연결 오류가 발생했습니다' });
    }
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