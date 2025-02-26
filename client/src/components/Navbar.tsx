import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquare, User, Home } from "lucide-react";
import UserAvatar from './common/UserAvatar';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          <span>채팅앱</span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span>홈</span>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/chat" 
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <MessageSquare className="h-4 w-4" />
                <span>채팅</span>
              </Link>
              
              <div className="flex items-center gap-2">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2"
                >
                  <UserAvatar username={user?.username || ''} size="sm" />
                  <span className="text-sm hidden md:inline">{user?.username}</span>
                </Link>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">로그아웃</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/login')}
              >
                로그인
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate('/register')}
              >
                회원가입
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar; 