import React from 'react';
import { Chip, Box, SxProps, Theme } from '@mui/material';
import { 
  CheckCircle, 
  Warning, 
  Error, 
  Sync
} from '@mui/icons-material';
import { ConnectionStatus } from '../../types/message';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  onReconnect?: () => void;
  sx?: SxProps<Theme>;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  status,
  onReconnect,
  sx
}) => {
  let color: 'success' | 'warning' | 'error' | 'default' = 'default';
  let icon = null;
  let label = '';

  switch (status) {
    case 'connected':
      color = 'success';
      icon = <CheckCircle />;
      label = '연결됨';
      break;
    case 'connecting':
      color = 'warning';
      icon = <Sync />;
      label = '연결 중...';
      break;
    case 'disconnected':
      color = 'error';
      icon = <Error />;
      label = '연결 끊김';
      break;
    default:
      color = 'default';
      icon = <Warning />;
      label = '상태 알 수 없음';
  }

  const handleClick = () => {
    if (status === 'disconnected' && onReconnect) {
      onReconnect();
    }
  };

  return (
    <Box sx={sx}>
      <Chip
        icon={icon}
        label={label}
        color={color}
        onClick={status === 'disconnected' && onReconnect ? handleClick : undefined}
        clickable={status === 'disconnected' && !!onReconnect}
        size="small"
      />
    </Box>
  );
};

export default ConnectionStatusIndicator; 