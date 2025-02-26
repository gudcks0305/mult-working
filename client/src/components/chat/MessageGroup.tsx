import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { Message as MessageType } from '../../types/message';

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
  isCurrentUser,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: isCurrentUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          mb: 1
        }}
      >
        <Avatar sx={{ mr: isCurrentUser ? 0 : 2, ml: isCurrentUser ? 2 : 0 }}>
          {username?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography 
          variant="subtitle2"
          sx={{ 
            fontWeight: 600,
            alignSelf: 'center'
          }}
        >
          {username}
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
          ml: isCurrentUser ? 0 : 6,
          mr: isCurrentUser ? 6 : 0
        }}
      >
        {messages.map((message) => (
          <Box 
            key={message.id} 
            sx={{
              backgroundColor: isCurrentUser ? 'primary.main' : 'grey.200',
              color: isCurrentUser ? 'white' : 'text.primary',
              borderRadius: 2,
              p: 2,
              mb: 1,
              maxWidth: '80%'
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
        ))}
      </Box>
    </Box>
  );
};

export default MessageGroup; 