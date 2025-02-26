import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Message as MessageType, ConnectionStatus } from '../../types/message';
import MessageGroup from './MessageGroup';
import { useInView } from 'react-intersection-observer';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowDown, AlertCircle } from "lucide-react";

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
    rootMargin: '500px 0px 0px 0px'
  });

  // 하단 요소의 가시성 감지
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
      
      if (!bottomVisible) {
        setShowScrollButton(true);
      } else {
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
  
  // 스크롤 이벤트 리스너
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      
      if (isAtBottom) {
        setShowScrollButton(false);
        setHasNewMessage(false);
      } else {
        setShowScrollButton(true);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 컨테이너 위치 계산
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateButtonPosition = () => {
      const rect = container.getBoundingClientRect();
      setButtonPosition({
        right: 16,
        bottom: window.innerHeight - rect.bottom + 70
      });
    };
    
    updateButtonPosition();
    
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
    return groups.map(group => ({
      ...group,
      isCurrentUser: group.userId === currentUserId
    }));
  }, [messages, currentUserId]);
  
  if (messages.length === 0 && isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (messages.length === 0 && error) {
    return (
      <div className="p-2">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          {connectionStatus === 'disconnected' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReconnect}
              className="mt-2"
            >
              재연결
            </Button>
          )}
        </Alert>
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">
          메시지가 없습니다. 첫 메시지를 보내보세요!
        </p>
      </div>
    );
  }
  
  return (
    <ScrollArea
      ref={containerRef}
      className="relative h-full flex flex-col"
      viewportRef={containerRef}
    >
      {/* 로드 더 보기 인디케이터 */}
      {hasMore && (
        <div ref={loadMoreRef} className="p-2 text-center">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          ) : (
            <p className="text-sm text-muted-foreground">
              이전 메시지 로딩...
            </p>
          )}
        </div>
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
        <div className="p-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
            {connectionStatus === 'disconnected' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReconnect}
                className="mt-2"
              >
                재연결
              </Button>
            )}
          </Alert>
        </div>
      )}
      
      {/* 하단 감지용 요소 */}
      <div ref={bottomRef} className="h-1" />
      
      {/* 스크롤 참조용 요소 */}
      <div ref={messagesEndRef} />
      
      {/* 아래로 스크롤 버튼 */}
      {showScrollButton && (
        <Button
          size="icon"
          variant={hasNewMessage ? "default" : "secondary"}
          className="fixed rounded-full opacity-80 shadow-md"
          style={{
            bottom: buttonPosition.bottom,
            right: buttonPosition.right,
            zIndex: 10
          }}
          onClick={() => scrollToBottom()}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </ScrollArea>
  );
};

export default React.memo(MessageList); 