import React from 'react';
import { Message } from '../../types/message';
import { formatTime } from '../../utils/date';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  return (
    <div 
      className={`rounded-lg p-3 inline-block max-w-full ${
        isCurrentUser 
          ? 'bg-blue-500 text-white rounded-tr-none' 
          : 'bg-white border rounded-tl-none'
      }`}
    >
      <div className="break-words">{message.content}</div>
      <div
        className={`text-xs mt-1 text-right ${
          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
        }`}
      >
        {formatTime(message.createdAt)}
      </div>
    </div>
  );
};

export default MessageBubble; 