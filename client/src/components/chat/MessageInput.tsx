import React, { useState } from 'react';
import Button from '../common/Button';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholderText?: string;
  disabledMessage?: string;
  onReconnect?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  placeholderText = '메시지를 입력하세요...',
  disabledMessage = '메시지를 보내려면 연결이 필요합니다.',
  onReconnect
}) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSend(message);
    setMessage('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white border-t p-4">
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholderText}
          className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        />
        <Button
          type="submit"
          disabled={disabled}
          className="rounded-l-none rounded-r-lg"
        >
          전송
        </Button>
      </div>
      
      {disabled && (
        <p className="text-sm text-red-500 mt-2">
          {disabledMessage}
          {onReconnect && (
            <button 
              onClick={onReconnect}
              className="ml-2 text-blue-500 hover:underline"
            >
              재연결
            </button>
          )}
        </p>
      )}
    </form>
  );
};

export default MessageInput; 