import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import React from 'react';
import { Message as MessageType } from '../../types/message';
import { formatMessageTime } from '../../utils/date';

interface MessageProps {
  message: MessageType;
  isCurrentUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isCurrentUser }) => {
  const formattedTime = formatMessageTime(message.createdAt);
  const firstLetter = message.username ? message.username.charAt(0).toUpperCase() : '?';
  
  return (
    <div className={`flex items-start gap-2 group ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.username}`} />
          <AvatarFallback>{firstLetter}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[90%]`}>
        <Card className={`w-full ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
          <CardContent className="px-4 py-2 break-words text-base">
            {message.content}
          </CardContent>
        </Card>
        
        <span className="text-xs text-muted-foreground mt-1 opacity-70 group-hover:opacity-100">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};

export default Message; 