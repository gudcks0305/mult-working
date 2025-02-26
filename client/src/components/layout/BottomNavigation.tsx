import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home, Chat, Person, Login, Logout } from '@mui/icons-material';

const BottomNavigationBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const getPathValue = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/chat') return 1;
    if (path === '/profile') return 2;
    if (path === '/login' || path === '/logout') return 3;
    return -1;
  };
  
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/chat');
        break;
      case 2:
        navigate('/profile');
        break;
      case 3:
        navigate(isAuthenticated ? '/logout' : '/login');
        break;
    }
  };
  
  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        display: { xs: 'block', md: 'none' },
        zIndex: 1000
      }} 
      elevation={3}
    >
      <MuiBottomNavigation
        showLabels
        value={getPathValue()}
        onChange={handleChange}
      >
        <BottomNavigationAction label="홈" icon={<Home />} />
        {isAuthenticated && <BottomNavigationAction label="채팅" icon={<Chat />} />}
        {isAuthenticated && <BottomNavigationAction label="프로필" icon={<Person />} />}
        <BottomNavigationAction 
          label={isAuthenticated ? "로그아웃" : "로그인"} 
          icon={isAuthenticated ? <Logout /> : <Login />} 
        />
      </MuiBottomNavigation>
    </Paper>
  );
};

export default BottomNavigationBar; 