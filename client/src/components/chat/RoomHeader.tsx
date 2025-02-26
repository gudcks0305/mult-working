import React from 'react';
import { Room } from '../../types/room';
import { ConnectionStatus } from '../../types/message';
import ConnectionStatusIndicator from '../common/ConnectionStatus';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Button, 
  Box,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import { ArrowBack, ExitToApp, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface RoomHeaderProps {
  room: Room | null;
  connectionStatus: ConnectionStatus;
  onLeave: () => void;
  onReconnect: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({
  room,
  connectionStatus,
  onLeave,
  onReconnect,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleGoBack = () => {
    navigate('/chat');
  };
  
  const handleTestConnection = () => {
    onReconnect();
  };
  
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <IconButton 
          edge="start" 
          color="inherit" 
          aria-label="back"
          onClick={handleGoBack}
          sx={{ mr: 2 }}
        >
          <ArrowBack />
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap>
            {room?.name || '로딩 중...'}
          </Typography>
          {!isMobile && room && (
            <Typography variant="caption" color="textSecondary">
              참여자: {room.userCount || 0}명
            </Typography>
          )}
        </Box>
        
        <ConnectionStatusIndicator 
          status={connectionStatus}
          onReconnect={onReconnect}
          sx={{ mr: 2 }}
        />
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleTestConnection}
          startIcon={<Refresh />}
          size="small"
          sx={{ mr: 1 }}
        >
          연결 테스트
        </Button>
        
        <Button
          variant="contained"
          color="error"
          onClick={onLeave}
          startIcon={<ExitToApp />}
          size="small"
        >
          나가기
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default RoomHeader; 