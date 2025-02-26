import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoomStore, Room } from '../store/roomStore';

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
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">채팅방</h1>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* 내 채팅방 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">내 채팅방</h2>
        {isLoading ? (
          <div className="text-center py-4">로딩 중...</div>
        ) : userRooms && userRooms.length === 0 ? (
          <div className="text-center py-4 text-gray-500">아직 참여한 채팅방이 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userRooms && userRooms.map((room) => (
              <Link 
                key={room.id} 
                to={`/chat/${room.id}`}
                className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-lg">{room.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{room.description}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>참여자: {room.userCount}명</span>
                  <span>생성일: {new Date(room.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* 채팅방 생성 버튼 */}
      <div className="mb-8">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            새 채팅방 만들기
          </button>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-bold text-lg mb-4">새 채팅방 만들기</h3>
            <form onSubmit={handleCreateRoom}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="roomName">
                  채팅방 이름
                </label>
                <input
                  id="roomName"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="채팅방 이름을 입력하세요"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="roomDescription">
                  설명 (선택사항)
                </label>
                <textarea
                  id="roomDescription"
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="채팅방에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={isLoading}
                >
                  생성하기
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {/* 모든 채팅방 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">모든 채팅방</h2>
        {isLoading ? (
          <div className="text-center py-4">로딩 중...</div>
        ) : rooms && rooms.length === 0 ? (
          <div className="text-center py-4 text-gray-500">채팅방이 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms && rooms.map((room) => (
              <div 
                key={room.id} 
                className="p-4 border rounded-lg"
              >
                <h3 className="font-bold text-lg">{room.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{room.description}</p>
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>참여자: {room.userCount}명</span>
                  <span>생성일: {new Date(room.createdAt).toLocaleDateString()}</span>
                </div>
                {userRoomIds.includes(room.id) ? (
                  <Link 
                    to={`/chat/${room.id}`}
                    className="block text-center bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    입장하기
                  </Link>
                ) : (
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    참여하기
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 