import React, { useState } from 'react';
import { Box, TextField, Button, Paper } from '@mui/material';
import { Send } from '@mui/icons-material';

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
    <Box sx={{ 
      p: 2, 
      borderTop: 1, 
      borderColor: 'divider',
      bgcolor: 'background.paper',
      position: 'relative',
      zIndex: 20 // 다른 요소들보다 앞에 표시
    }}>
      <Paper 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
        }}
        elevation={3}
      >
        <TextField
          fullWidth
          placeholder="메시지를 입력하세요..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          helperText={disabled && disabledMessage}
          sx={{ mr: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={!message.trim() || disabled}
          endIcon={<Send />}
        >
          전송
        </Button>
        {disabled && onReconnect && (
          <Button 
            variant="outlined"
            color="primary"
            onClick={onReconnect}
            sx={{ ml: 1 }}
          >
            재연결
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default MessageInput; 