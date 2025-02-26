import React from 'react';
import { ConnectionStatus } from '../../types/message';

interface ConnectionStatusProps {
  status: ConnectionStatus;
  onReconnect?: () => void;
  className?: string;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({
  status,
  onReconnect,
  className = '',
}) => {
  // 상태에 따른 스타일 및 텍스트 매핑
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return { color: 'bg-green-500', text: '연결됨' };
      case 'connecting':
        return { color: 'bg-yellow-500', text: '연결 중...' };
      case 'reconnecting':
        return { color: 'bg-yellow-500', text: '재연결 중...' };
      case 'disconnected':
        return { color: 'bg-red-500', text: '연결 끊김' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`w-3 h-3 rounded-full ${statusInfo.color} mr-2`}></div>
      <span className="text-sm">{statusInfo.text}</span>
      {status === 'disconnected' && onReconnect && (
        <button 
          onClick={onReconnect}
          className="ml-2 text-blue-500 text-sm hover:underline"
        >
          재연결
        </button>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator; 