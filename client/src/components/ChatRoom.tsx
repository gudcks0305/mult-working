import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/roomStore';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import { Box } from '@mui/material';
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
  
  // 채팅방 정보 및 메시지 로드
  useEffect(() => {
    if (!roomId) return;
    
    const numericRoomId = parseInt(roomId);
    
    // 메시지 초기화
    clearMessages();
    clearError();
    
    // 채팅방 정보 로드
    const loadRoomData = async () => {
      try {
        // 사용자 채팅방 목록 로드
        await fetchUserRooms();
        
        // 현재 채팅방 설정
        const rooms = useRoomStore.getState().userRooms;
        const room = rooms.find(r => r.id === numericRoomId);
        
        if (room) {
          setCurrentRoom(room);
          
          // 첫 페이지 메시지 로드
          await fetchMessages(numericRoomId, 1, true);
          
          // 웹소켓 연결
          connectWebSocket(numericRoomId);
        } else {
          // 참여하지 않은 채팅방인 경우
          navigate('/chat');
        }
      } catch (error) {
        console.error('Error loading room data:', error);
      }
    };
    
    loadRoomData();
    
    // 컴포넌트 언마운트 시 웹소켓 연결 종료
    return () => {
      disconnectWebSocket();
      setCurrentRoom(null);
    };
  }, [roomId]);
  
  // 이전 메시지 로드 핸들러
  const handleLoadMoreMessages = useCallback(() => {
    if (!roomId || !hasMore || isLoading) return;
    
    fetchMessages(parseInt(roomId), page + 1);
  }, [roomId, hasMore, isLoading, page, fetchMessages]);
  
  // 메시지 전송 핸들러
  const handleSendMessage = (content: string) => {
    if (!roomId) return;
    sendMessage(content, parseInt(roomId));
  };
  
  // 채팅방 나가기 핸들러
  const handleLeaveRoom = () => {
    if (!roomId) return;
    leaveRoom(parseInt(roomId)).then(() => {
      navigate('/chat');
    });
  };
  
  // 연결 재시도 핸들러
  const handleReconnect = () => {
    if (!roomId) return;
    clearError();
    connectWebSocket(parseInt(roomId));
  };
  
  // 웹소켓 연결 테스트
  const handleTestConnection = () => {
    if (!roomId) return;
    
    clearError();
    console.log('Current connection status:', connectionStatus);
    
    if (connectionStatus === 'connected') {
      const socket = useMessageStore.getState().socket;
      if (socket) {
        try {
          socket.send(JSON.stringify({
            type: 'ping',
            payload: { timestamp: new Date().toISOString() }
          }));
          console.log('Ping message sent');
        } catch (error) {
          console.error('Error sending ping message:', error);
        }
      }
    } else {
      connectWebSocket(parseInt(roomId));
    }
  };
  
  // 초기 로딩 효과 추가
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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh'
    }}>
      {/* 채팅방 헤더 */}
      <RoomHeader
        room={currentRoom}
        connectionStatus={connectionStatus}
        onLeave={handleLeaveRoom}
        onReconnect={handleReconnect}
      />
      
      {/* 메시지 목록 */}
      <Box 
        className="messages-container"
        sx={{ 
          flexGrow: 1, 
          display: 'flex',
          flexDirection: 'column',
          p: 0, 
          bgcolor: 'grey.100',
          position: 'relative',
          mb: 0
        }}
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
      </Box>
      
      {/* 메시지 입력 */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={connectionStatus !== 'connected'}
        disabledMessage="메시지를 보내려면 연결이 필요합니다."
        onReconnect={connectionStatus === 'disconnected' ? handleReconnect : undefined}
      />
    </Box>
  );
};

export default ChatRoom; 