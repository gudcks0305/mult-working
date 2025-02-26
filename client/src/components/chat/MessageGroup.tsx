import React from 'react';
import { Message } from '../../types/message';
import MessageBubble from './MessageBubble';
import UserAvatar from '../common/UserAvatar';

interface MessageGroupProps {
  userId: number;
  username: string;
  messages: Message[];
  isCurrentUser: boolean;
}

const MessageGroup: React.FC<MessageGroupProps> = ({
  username,
  messages,
  isCurrentUser,
}) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {/* 프로필 이미지 (다른 사용자만) */}
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-3">
          <UserAvatar username={username} />
        </div>
      )}
      
      {/* 메시지 그룹 */}
      <div className={`max-w-[70%] ${isCurrentUser ? '' : 'ml-2'}`}>
        {/* 사용자 이름 (다른 사용자만) */}
        {!isCurrentUser && (
          <div className="font-bold text-sm mb-1">{username}</div>
        )}
        
        {/* 메시지 말풍선 */}
        <div className="space-y-1">
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isCurrentUser={isCurrentUser} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageGroup; 