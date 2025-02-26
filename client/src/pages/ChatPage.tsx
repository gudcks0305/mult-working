import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/roomStore';
import RoomList from '../components/chat/RoomList';
import CreateRoomForm from '../components/chat/CreateRoomForm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Plus, Users, History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    rooms, 
    userRooms,
    fetchRooms, 
    fetchUserRooms, 
    joinRoom,
    isLoading, 
    error, 
    clearError,
    createRoom
  } = useRoomStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  
  // 방 목록 필터링
  const displayedRooms = searchQuery
    ? rooms.filter(room => 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : rooms;
  
  // 내 채팅방 필터링  
  const displayedUserRooms = searchQuery
    ? userRooms.filter(room => 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : userRooms;
  
  // 초기 데이터 로드
  useEffect(() => {
    fetchRooms();
    fetchUserRooms();
    
    return () => {
      clearError();
    };
  }, []);
  
  // 채팅방 참여 처리
  const handleJoinRoom = async (roomId: number) => {
    const success = await joinRoom(roomId);
    if (success) {
      navigate(`/chat/room/${roomId}`);
    }
  };
  
  // 래퍼 함수 추가
  const handleCreateFormSubmit = async (data: { name: string; description: string }) => {
    const result = await createRoom(data.name, data.description);
    if (result) {
      setCreateRoomOpen(false);
      // 새로 생성된 방 ID를 찾아서 이동
      const rooms = await fetchUserRooms();
      const newRoom = rooms[rooms.length - 1];
      if (newRoom) {
        navigate(`/chat/room/${newRoom.id}`);
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">채팅</h1>
            <p className="text-muted-foreground mt-1">
              채팅방에 참여하거나 새로운 채팅방을 만들어보세요
            </p>
          </div>
          
          <Dialog open={createRoomOpen} onOpenChange={setCreateRoomOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>채팅방 만들기</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 채팅방 만들기</DialogTitle>
                <DialogDescription>
                  새로운 채팅방을 만들고 친구들을 초대하세요.
                </DialogDescription>
              </DialogHeader>
              <CreateRoomForm onSubmit={handleCreateFormSubmit} isLoading={isLoading} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="mb-6">
          <Input
            type="text"
            placeholder="채팅방 검색..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>모든 채팅방</span>
            </TabsTrigger>
            <TabsTrigger value="my" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>내 채팅방</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>모든 채팅방</CardTitle>
                <CardDescription>
                  참여할 수 있는 모든 채팅방 목록입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : error ? (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                      <p>{error}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fetchRooms()}
                        className="mt-2"
                      >
                        다시 시도
                      </Button>
                    </div>
                  ) : displayedRooms.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {searchQuery ? '검색 결과가 없습니다.' : '채팅방이 없습니다.'}
                    </p>
                  ) : (
                    <RoomList
                      rooms={displayedRooms}
                      isLoading={isLoading}
                      onJoinRoom={handleJoinRoom}
                    />
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="my">
            <Card>
              <CardHeader>
                <CardTitle>내 채팅방</CardTitle>
                <CardDescription>
                  참여 중인 채팅방 목록입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : error ? (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                      <p>{error}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fetchUserRooms()}
                        className="mt-2"
                      >
                        다시 시도
                      </Button>
                    </div>
                  ) : displayedUserRooms.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {searchQuery ? '검색 결과가 없습니다.' : '참여 중인 채팅방이 없습니다.'}
                    </p>
                  ) : (
                    <RoomList
                      rooms={displayedUserRooms}
                      isLoading={isLoading}
                      onJoinRoom={handleJoinRoom}
                    />
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChatPage; 