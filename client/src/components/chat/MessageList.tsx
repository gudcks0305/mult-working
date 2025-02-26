import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Fab, Zoom } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { Message as MessageType, ConnectionStatus } from '../../types/message';
import MessageGroup from './MessageGroup';
import { useInView } from 'react-intersection-observer';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  error: string | null;
  currentUserId?: number;
  connectionStatus: ConnectionStatus;
  onReconnect: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

// 메시지를 발신자별로 그룹화하는 함수
const groupMessagesByUser = (messages: MessageType[]) => {
  if (!messages.length) return [];
  
  const groups: { userId: number; username: string; messages: MessageType[]; isCurrentUser: boolean }[] = [];
  let currentGroup: MessageType[] = [messages[0]];
  let currentUserId = messages[0].userId;
  
  // 두 번째 메시지부터 순회하며 그룹화
  for (let i = 1; i < messages.length; i++) {
    const message = messages[i];
    
    // 같은 사용자의 메시지면 현재 그룹에 추가
    if (message.userId === currentUserId) {
      currentGroup.push(message);
    } 
    // 다른 사용자의 메시지면 이전 그룹을 완료하고 새 그룹 시작
    else {
      groups.push({
        userId: currentUserId,
        username: currentGroup[0].username || '알 수 없음',
        messages: [...currentGroup],
        isCurrentUser: false // 임시값, 나중에 설정됨
      });
      
      currentGroup = [message];
      currentUserId = message.userId;
    }
  }
  
  // 마지막 그룹 추가
  groups.push({
    userId: currentUserId,
    username: currentGroup[0].username || '알 수 없음',
    messages: [...currentGroup],
    isCurrentUser: false // 임시값, 나중에 설정됨
  });
  
  return groups;
};

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  error,
  currentUserId,
  connectionStatus,
  onReconnect,
  onLoadMore,
  hasMore
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [prevMessageCount, setPrevMessageCount] = useState(0);
  const [buttonPosition, setButtonPosition] = useState({ right: 16, bottom: 70 });
  
  // IntersectionObserver 설정 - 무한 스크롤용
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    // 스크롤을 위로 올릴 때만 감지하기 위한 설정
    rootMargin: '500px 0px 0px 0px'
  });

  // 하단 요소의 가시성 감지 (스크롤 위치 확인용)
  const { ref: bottomRef, inView: bottomVisible } = useInView({
    threshold: 0.1,
    rootMargin: '0px 0px 20px 0px'
  });
  
  // 새 메시지 감지
  useEffect(() => {
    if (messages.length > prevMessageCount) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.userId !== currentUserId) {
        setHasNewMessage(true);
      }
      
      // 하단이 보이지 않는 경우에만 스크롤 버튼 표시
      if (!bottomVisible) {
        setShowScrollButton(true);
      } else {
        // 하단이 보이면 자동으로 스크롤
        scrollToBottom('smooth');
      }
    }
    setPrevMessageCount(messages.length);
  }, [messages, prevMessageCount, currentUserId, bottomVisible]);
  
  // 스크롤 위치에 따라 버튼 표시/숨김
  useEffect(() => {
    if (bottomVisible) {
      setShowScrollButton(false);
    } else if (messages.length > 0 && !initialLoad) {
      setShowScrollButton(true);
    }
  }, [bottomVisible, messages.length, initialLoad]);
  
  // 초기 로드 시 스크롤 아래로
  useEffect(() => {
    if (initialLoad && messages.length > 0) {
      scrollToBottom('auto');
      setInitialLoad(false);
    }
  }, [messages, initialLoad]);
  
  // InView 상태가 변경될 때 더 많은 메시지 로드
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);
  
  // 스크롤 이벤트 리스너 수정
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // 완전히 바닥에 닿았을 때만 버튼을 숨김 (더 엄격한 조건)
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      
      if (isAtBottom) {
        setShowScrollButton(false);
        setHasNewMessage(false);
      } else {
        // 바닥에서 조금만 벗어나도 버튼 표시
        setShowScrollButton(true);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 컨테이너 위치 계산용 이펙트 추가
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // 컨테이너 위치 계산 함수
    const updateButtonPosition = () => {
      const rect = container.getBoundingClientRect();
      setButtonPosition({
        right: 16,
        bottom: window.innerHeight - rect.bottom + 70
      });
    };
    
    // 초기 위치 계산
    updateButtonPosition();
    
    // 스크롤과 리사이즈 이벤트에 반응
    window.addEventListener('resize', updateButtonPosition);
    container.addEventListener('scroll', updateButtonPosition);
    
    return () => {
      window.removeEventListener('resize', updateButtonPosition);
      container.removeEventListener('scroll', updateButtonPosition);
    };
  }, []);
  
  // 맨 아래로 스크롤하는 함수
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setHasNewMessage(false);
  }, []);
  
  // 메시지 그룹화
  const messageGroups = React.useMemo(() => {
    const groups = groupMessagesByUser(messages);
    // 현재 사용자 여부 설정
    return groups.map(group => ({
      ...group,
      isCurrentUser: group.userId === currentUserId
    }));
  }, [messages, currentUserId]);
  
  if (messages.length === 0 && isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (messages.length === 0 && error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert 
          severity="error" 
          action={
            connectionStatus === 'disconnected' && (
              <Button color="inherit" size="small" onClick={onReconnect}>
                재연결
              </Button>
            )
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  if (messages.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="textSecondary">
          메시지가 없습니다. 첫 메시지를 보내보세요!
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        overflow: 'auto'
      }}
    >
      {/* 로드 더 보기 인디케이터 - 상단에 배치 */}
      {hasMore && (
        <Box ref={loadMoreRef} sx={{ p: 2, textAlign: 'center' }}>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="body2" color="textSecondary">
              이전 메시지 로딩...
            </Typography>
          )}
        </Box>
      )}
      
      {/* 메시지 그룹 */}
      {messageGroups.map((group, index) => (
        <MessageGroup
          key={`${group.userId}-${index}`}
          userId={group.userId}
          username={group.username}
          messages={group.messages}
          isCurrentUser={group.isCurrentUser}
        />
      ))}
      
      {/* 에러 표시 */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert 
            severity="error" 
            action={
              connectionStatus === 'disconnected' && (
                <Button color="inherit" size="small" onClick={onReconnect}>
                  재연결
                </Button>
              )
            }
          >
            {error}
          </Alert>
        </Box>
      )}
      
      {/* 하단 감지용 요소 */}
      <div ref={bottomRef} style={{ height: 5 }} />
      
      {/* 스크롤 참조용 요소 - 항상 맨 아래에 위치 */}
      <div ref={messagesEndRef} />
      
      {/* 아래로 스크롤 버튼 */}
      <Zoom in={showScrollButton}>
        <Fab
          size="small"
          color={hasNewMessage ? 'secondary' : 'default'}
          sx={{
            position: 'fixed',  // 절대 위치에서 고정 위치로 변경
            bottom: buttonPosition.bottom,
            right: buttonPosition.right,
            opacity: 0.8,
            boxShadow: hasNewMessage ? 4 : 2,
            zIndex: 10
          }}
          onClick={() => scrollToBottom()}
        >
          <KeyboardArrowDown />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default React.memo(MessageList); 