import React from 'react';
import { Message as MessageType } from '../../types/message';
import Message from './Message';
import { Separator } from "@/components/ui/separator";

interface MessageGroupProps {
  userId: number;
  username: string;
  messages: MessageType[];
  isCurrentUser: boolean;
}

const MessageGroup: React.FC<MessageGroupProps> = ({
  userId,
  username,
  messages,
  isCurrentUser
}) => {
  // 각 날짜 그룹의 첫 메시지 시간으로 날짜 헤더 표시
  const getDateHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = 
      date.getDate() === today.getDate() && 
      date.getMonth() === today.getMonth() && 
      date.getFullYear() === today.getFullYear();
    
    const isYesterday = 
      date.getDate() === yesterday.getDate() && 
      date.getMonth() === yesterday.getMonth() && 
      date.getFullYear() === yesterday.getFullYear();
    
    if (isToday) return '오늘';
    if (isYesterday) return '어제';
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // 첫 메시지의 날짜
  const firstMessageDate = new Date(messages[0].createdAt);
  const dateHeader = getDateHeader(firstMessageDate);
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-center mb-4">
        <Separator className="flex-grow" />
        <span className="px-2 text-xs text-muted-foreground">
          {dateHeader}
        </span>
        <Separator className="flex-grow" />
      </div>
      
      <div className="space-y-2">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isCurrentUser={isCurrentUser}
          />
        ))}
      </div>
    </div>
  );
};

export default MessageGroup; 