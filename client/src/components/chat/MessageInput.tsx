import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  disabledMessage?: string;
  onReconnect?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  disabledMessage = '',
  onReconnect,
}) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };
  
  return (
    <div className="p-2 border-t border-border bg-background relative z-20">
      <form 
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-2 bg-card rounded-lg shadow-sm"
      >
        <Input
          placeholder="메시지를 입력하세요..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          className="flex-1"
        />
        
        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={!message.trim() || disabled}
        >
          <Send className="h-4 w-4 mr-1" /> 전송
        </Button>
        
        {disabled && onReconnect && (
          <Button 
            variant="outline"
            size="sm"
            onClick={onReconnect}
          >
            재연결
          </Button>
        )}
      </form>
      
      {disabled && disabledMessage && (
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {disabledMessage}
        </p>
      )}
    </div>
  );
};

export default MessageInput; 