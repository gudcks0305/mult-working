import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">실시간 채팅 애플리케이션</h1>
        <p className="text-xl text-gray-600 mb-8">
          친구들과 실시간으로 대화하고 새로운 사람들을 만나보세요.
          다양한 주제의 채팅방에 참여하거나 나만의 채팅방을 만들 수 있습니다.
        </p>
        
        {isAuthenticated ? (
          <div className="space-y-4">
            <Link
              to="/chat"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600"
            >
              채팅방 둘러보기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <Link
              to="/login"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 mr-4"
            >
              로그인
            </Link>
            <Link
              to="/register"
              className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">실시간 채팅</h2>
          <p className="text-gray-600">
            웹소켓을 이용한 실시간 채팅으로 지연 없이 대화를 나눌 수 있습니다.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">다양한 채팅방</h2>
          <p className="text-gray-600">
            관심사에 맞는 채팅방에 참여하거나 직접 채팅방을 만들어 대화를 시작하세요.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">안전한 인증</h2>
          <p className="text-gray-600">
            JWT 기반의 안전한 인증 시스템으로 개인정보를 보호합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 