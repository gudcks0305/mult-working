import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/roomStore';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import RoomHeader from './chat/RoomHeader';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const { user } = useAuthStore();
  const { 
    currentRoom, 
    fetchUserRooms,
    getRoomById,
    leaveRoom, 
    setCurrentRoom 
  } = useRoomStore();
  
  const { 
    messages, 
    isLoading, 
    error, 
    connectionStatus,
    hasMore,
    page,
    fetchMessages, 
    sendMessage, 
    connectWebSocket, 
    disconnectWebSocket,
    clearMessages,
    clearError
  } = useMessageStore();
  
  // 함수 추가
  const fetchRoomById = async (id: number) => {
    // 이미 userRooms에 있는지 확인
    const rooms = useRoomStore.getState().userRooms;
    const room = rooms.find(r => r.id === id);
    
    if (room) {
      return room;
    }
    
    // API에서 직접 가져오기
    return await getRoomById(id);
  };
  
  // 채팅방 정보 및 메시지 로드
  useEffect(() => {
    if (!roomId) return;
    
    console.log('ChatRoom mounted with roomId:', roomId);
    
    const numericRoomId = parseInt(roomId);
    
    // 메시지 초기화
    clearMessages();
    clearError();
    
    // 채팅방 정보 로드
    const loadRoomData = async () => {
      try {
        console.log('Loading room data for roomId:', numericRoomId);
        
        // 사용자 채팅방 목록 로드
        await fetchUserRooms();
        
        // 현재 방 설정
        const room = await fetchRoomById(numericRoomId);
        console.log('Fetched room:', room);
        
        if (!room) {
          console.error('Room not found');
          navigate('/chat');
          return;
        }
        
        setCurrentRoom(room);
        
        // 메시지 로드
        console.log('Fetching messages for roomId:', numericRoomId);
        await fetchMessages(numericRoomId);
        
        // 웹소켓 연결
        console.log('Connecting WebSocket for roomId:', numericRoomId);
        connectWebSocket(numericRoomId);
      } catch (err) {
        console.error('채팅방 데이터 로드 실패:', err);
        navigate('/chat');
      }
    };
    
    loadRoomData();
    
    // 컴포넌트 언마운트 시 웹소켓 연결 해제
    return () => {
      console.log('ChatRoom unmounted, disconnecting WebSocket');
      disconnectWebSocket();
    };
  }, [roomId]);
  
  // 채팅방 나가기
  const handleLeaveRoom = async () => {
    if (!roomId) return;
    
    try {
      await leaveRoom(parseInt(roomId));
      navigate('/chat');
    } catch (err) {
      console.error('채팅방 나가기 실패:', err);
    }
  };
  
  // 메시지 전송 함수 변경
  const handleSendMessage = useCallback((content: string) => {
    if (!roomId) return;
    sendMessage(content, parseInt(roomId)); // 문자열을 숫자로 변환
  }, [roomId, sendMessage]);
  
  // 추가 메시지 로드 함수 변경
  const handleLoadMoreMessages = useCallback(() => {
    if (!roomId || !hasMore) return;
    fetchMessages(parseInt(roomId), page + 1); // 문자열을 숫자로 변환
  }, [roomId, page, hasMore, fetchMessages]);
  
  // 재연결 함수 변경
  const handleReconnect = useCallback(() => {
    if (!roomId) return;
    connectWebSocket(parseInt(roomId)); // 문자열을 숫자로 변환
  }, [roomId, connectWebSocket]);
  
  // 로딩 효과 추가
  useEffect(() => {
    // 메시지가 로드되면 스크롤을 맨 아래로 이동
    if (!isLoading && messages.length > 0) {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [isLoading]);
  
  return (
    <div className="flex flex-col h-screen">
      {/* 채팅방 헤더 */}
      <RoomHeader
        room={currentRoom}
        connectionStatus={connectionStatus}
        onLeave={handleLeaveRoom}
        onReconnect={handleReconnect}
      />
      
      {/* 메시지 목록 */}
      <div 
        className="messages-container flex-1 flex flex-col bg-background-secondary relative mb-0 overflow-hidden"
      >
        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
          currentUserId={user?.id}
          onReconnect={handleReconnect}
          connectionStatus={connectionStatus}
          onLoadMore={handleLoadMoreMessages}
          hasMore={hasMore}
        />
      </div>
      
      {/* 메시지 입력 */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={connectionStatus !== 'connected'}
        disabledMessage="메시지를 보내려면 연결이 필요합니다."
        onReconnect={connectionStatus === 'disconnected' ? handleReconnect : undefined}
      />
    </div>
  );
};

export default ChatRoom; 