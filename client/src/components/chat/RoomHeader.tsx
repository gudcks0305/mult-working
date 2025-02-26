import React from 'react';
import Button from '../common/Button';
import ConnectionStatusIndicator from '../common/ConnectionStatus';
import { Room } from '../../types/room';
import { ConnectionStatus } from '../../types/message';

interface RoomHeaderProps {
  room: Room | null;
  connectionStatus: ConnectionStatus;
  onLeave: () => void;
  onReconnect: () => void;
  onTestConnection: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({
  room,
  connectionStatus,
  onLeave,
  onReconnect,
  onTestConnection
}) => {
  return (
    <div className="bg-white border-b p-4 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-bold">{room?.name}</h2>
        <p className="text-sm text-gray-500">{room?.description}</p>
      </div>
      <div className="flex items-center">
        {/* 연결 상태 표시 */}
        <ConnectionStatusIndicator 
          status={connectionStatus}
          onReconnect={onReconnect}
          className="mr-4"
        />
        <Button
          variant="primary"
          onClick={onTestConnection}
          className="mr-2"
        >
          연결 테스트
        </Button>
        <Button
          variant="danger"
          onClick={onLeave}
        >
          나가기
        </Button>
      </div>
    </div>
  );
};

export default RoomHeader; 