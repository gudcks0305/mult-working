import React, { useState } from 'react';
import { useRoomStore } from '../../store/roomStore';
import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const CreateRoomForm: React.FC = () => {
  const [roomName, setRoomName] = useState('');
  const [nameError, setNameError] = useState('');
  
  const { createRoom, isLoading, error } = useRoomStore();
  
  const validateForm = () => {
    if (!roomName.trim()) {
      setNameError('채팅방 이름을 입력해주세요.');
      return false;
    }
    
    if (roomName.length < 3) {
      setNameError('채팅방 이름은 3글자 이상이어야 합니다.');
      return false;
    }
    
    setNameError('');
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const success = await createRoom(roomName);
    if (success) {
      setRoomName('');
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        fullWidth
        label="채팅방 이름"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        disabled={isLoading}
        error={!!nameError}
        helperText={nameError}
        sx={{ mb: 2 }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={24} /> : <AddIcon />}
      >
        {isLoading ? '생성 중...' : '채팅방 생성하기'}
      </Button>
    </Box>
  );
};

export default CreateRoomForm; 