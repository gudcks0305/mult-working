import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoomStore, Room } from '../store/roomStore';
import RoomList from '../components/chat/RoomList';
import CreateRoomForm from '../components/chat/CreateRoomForm';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Divider,
  CircularProgress,
  List,
  ListItem, 
  ListItemText,
  ListItemButton
} from '@mui/material';

const ChatPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const navigate = useNavigate();
  
  const { 
    rooms, 
    userRooms, 
    isLoading, 
    error, 
    fetchRooms, 
    fetchUserRooms, 
    createRoom, 
    joinRoom 
  } = useRoomStore();
  
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    fetchRooms();
    fetchUserRooms();
  }, []);
  
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    
    createRoom(roomName, roomDescription).then(() => {
      setRoomName('');
      setRoomDescription('');
      setShowCreateForm(false);
    });
  };
  
  const handleJoinRoom = (roomId: number) => {
    joinRoom(roomId).then(() => {
      navigate(`/chat/${roomId}`);
    });
  };
  
  // 사용자가 참여한 채팅방 ID 목록
  const userRoomIds = userRooms.map(room => room.id);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const displayedRooms = activeTab === 0 ? rooms : userRooms;
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              채팅방 만들기
            </Typography>
            <CreateRoomForm />
          </Paper>
          
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              내 채팅방
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : userRooms.length > 0 ? (
              <List>
                {userRooms.map((room) => (
                  <ListItem 
                    key={room.id}
                    sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                  >
                    <ListItemButton component={Link} to={`/chat/${room.id}`}>
                      <ListItemText primary={room.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                참여 중인 채팅방이 없습니다.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="모든 채팅방" />
                <Tab label="내 채팅방" />
              </Tabs>
            </Box>
            
            {activeTab === 0 && (
              <Typography variant="body1" paragraph>
                참여할 공개 채팅방을 선택하세요.
              </Typography>
            )}
            
            {activeTab === 1 && (
              <Typography variant="body1" paragraph>
                참여 중인 채팅방 목록입니다.
              </Typography>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <RoomList
              rooms={displayedRooms}
              isLoading={isLoading}
              error={error}
              onJoinRoom={handleJoinRoom}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatPage; 