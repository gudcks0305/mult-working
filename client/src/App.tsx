import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, initAuth } from './store/authStore';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import ChatRoom from './components/ChatRoom';
import './App.css';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, token, fetchUser } = useAuthStore();
  
  useEffect(() => {
    // 토큰이 있지만 인증 상태가 아닌 경우 (앱 시작 시)
    if (token && !isAuthenticated) {
      fetchUser();
    }
  }, [token, isAuthenticated, fetchUser]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  // 앱 시작 시 인증 초기화
  useEffect(() => {
    initAuth();
  }, []);
  
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat/:roomId" 
              element={
                <ProtectedRoute>
                  <div className="h-[calc(100vh-64px)]">
                    <ChatRoom />
                  </div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
