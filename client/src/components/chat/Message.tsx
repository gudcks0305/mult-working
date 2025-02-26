import React from 'react';
import { Box, Typography } from '@mui/material';
import { Message as MessageType } from '../../types/message';

interface MessageProps {
  message: MessageType;
  isOwnMessage: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isOwnMessage }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', 
        mb: 2 
      }}
    >
      <Typography 
        variant="body1" 
        sx={{ 
          backgroundColor: isOwnMessage ? 'primary.main' : 'grey.300', 
          color: isOwnMessage ? 'white' : 'black', 
          borderRadius: 1, 
          p: 1, 
          maxWidth: '70%' 
        }}
      >
        {message.content}
      </Typography>
    </Box>
  );
};

export default Message; 