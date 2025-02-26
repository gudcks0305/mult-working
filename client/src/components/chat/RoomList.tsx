import React from 'react';
import { useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Typography, Paper, CircularProgress, Box, Divider } from '@mui/material';
import { Room } from '../../types/room';

interface RoomListProps {
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
  onJoinRoom: (roomId: number) => void;
}

const RoomList: React.FC<RoomListProps> = ({
  rooms,
  isLoading,
  error,
  onJoinRoom,
}) => {
  const navigate = useNavigate();
  
  const handleRoomClick = (roomId: number) => {
    onJoinRoom(roomId);
    navigate(`/chat/${roomId}`);
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  if (rooms.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="textSecondary">
          참여 가능한 채팅방이 없습니다.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Paper elevation={2}>
      <List>
        {rooms.map((room, index) => (
          <React.Fragment key={room.id}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleRoomClick(room.id)}>
                <ListItemAvatar>
                  <Avatar>
                    {room.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={room.name} 
                  secondary={`참여자: ${room.userCount || 0}명`} 
                />
              </ListItemButton>
            </ListItem>
            {index < rooms.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default RoomList; 