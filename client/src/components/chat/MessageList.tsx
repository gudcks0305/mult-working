import React, { useRef, useEffect } from 'react';
import { Message } from '../../types/message';
import MessageGroup from './MessageGroup';
import { groupMessages } from '../../utils/message';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentUserId?: number;
  onReconnect?: () => void;
  connectionStatus: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  error,
  currentUserId,
  onReconnect,
  connectionStatus,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 메시지 그룹화
  const groupedMessages = groupMessages(messages, currentUserId);
  
  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (isLoading) {
    return <div className="text-center py-4">로딩 중...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        {error}
        {connectionStatus === 'disconnected' && onReconnect && (
          <button 
            onClick={onReconnect}
            className="ml-2 text-blue-500 hover:underline"
          >
            재연결
          </button>
        )}
      </div>
    );
  }
  
  if (messages.length === 0) {
    return <div className="text-center py-4 text-gray-500">아직 메시지가 없습니다.</div>;
  }
  
  return (
    <div className="space-y-6">
      {groupedMessages.map((group, index) => (
        <MessageGroup
          key={index}
          userId={group.userId}
          username={group.username}
          messages={group.messages}
          isCurrentUser={group.isCurrentUser}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 