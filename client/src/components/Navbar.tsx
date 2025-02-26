import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              채팅 앱
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/chat" className="text-gray-600 hover:text-gray-900">
                  채팅방
                </Link>
                <span className="text-gray-600">
                  {user?.username}님 환영합니다
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 