import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { ConnectionStatus } from '../../types/message';
import { Room } from '../../types/room';
import { LogOut, Wifi, WifiOff } from "lucide-react";

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
  onReconnect
}) => {
  const getConnectionIcon = () => {
    switch(connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
      case 'reconnecting':
        return <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="px-4 py-3 flex items-center justify-between border-b bg-background">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">{room?.name || '로딩 중...'}</h1>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {getConnectionIcon()}
          <span>{connectionStatus === 'connected' ? '연결됨' : connectionStatus === 'disconnected' ? '연결 끊김' : '연결 중...'}</span>
        </div>
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-1" />
            나가기
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>채팅방 나가기</DialogTitle>
            <DialogDescription>
              채팅방을 나가면 이 방의 대화 내용을 더 이상 볼 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => document.querySelector('[data-dialog-close]')?.click()}>
              취소
            </Button>
            <Button variant="destructive" onClick={onLeave}>
              나가기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomHeader; 