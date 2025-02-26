import React from 'react';
import { Box, Typography } from '@mui/material';
import { Message } from '../../types/message';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
}) => {
  return (
    <Box 
      sx={{
        backgroundColor: isCurrentUser ? 'primary.main' : 'grey.200',
        color: isCurrentUser ? 'white' : 'text.primary',
        borderRadius: 2,
        p: 2,
        mb: 1,
        maxWidth: '80%',
        alignSelf: isCurrentUser ? 'flex-end' : 'flex-start'
      }}
    >
      <Typography variant="body1">{message.content}</Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block', 
          textAlign: 'right',
          mt: 0.5,
          opacity: 0.7
        }}
      >
        {new Date(message.createdAt).toLocaleTimeString()}
      </Typography>
    </Box>
  );
};

export default MessageBubble; 