import React from 'react';
import { Link } from 'react-router-dom';
import { Room } from '../../types/room';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";

interface RoomListProps {
  rooms: Room[];
  isLoading: boolean;
  onJoinRoom: (roomId: number) => Promise<void>;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, isLoading }) => {  
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // 오늘 날짜인지 확인
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `오늘 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">채팅방 목록을 불러오는 중...</p>
      </div>
    );
  }
  
  if (rooms.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">참여 중인 채팅방이 없습니다.</p>
        <p className="text-sm text-muted-foreground mt-1">새 채팅방을 만들어보세요!</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-3 p-3">
        {rooms.map((room) => (
          <Link key={room.id} to={`/chat/room/${room.id}`} className="block">
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{room.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {room.description || '설명 없음'}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        <span>{room.userCount || 0}명</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>{formatDate(room.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {room.unreadCount > 0 && (
                    <Badge variant="default" className="ml-2">
                      {room.unreadCount}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
};

export default RoomList; 