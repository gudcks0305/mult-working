import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import ChatRoom from './components/ChatRoom';
import BottomNavigation from './components/layout/BottomNavigation';

const App: React.FC = () => {
  return (
    <div>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Navbar />
          
          <main className="flex-1 container mx-auto px-4 pt-6 pb-20 md:pb-6">
            <Routes>
              {/* 공개 라우트 */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              
              {/* 보호된 라우트 */}
              <Route element={<ProtectedRoute />}>
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/room/:roomId" element={<ChatRoom />} />
                <Route path="/profile" element={<ProfilePage />} />
                {/* <Route path="/settings" element={<SettingsPage />} /> */}
              </Route>
              
              {/* 기본 리다이렉트 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          
          <BottomNavigation />
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
