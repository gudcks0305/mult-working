import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Avatar,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Menu as MenuIcon, AccountCircle, Chat, Home } from '@mui/icons-material';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };
  
  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ 
              mr: 2, 
              display: 'flex', 
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            채팅 앱
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile ? (
              <>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem component={Link} to="/" onClick={handleMenuClose}>
                    홈
                  </MenuItem>
                  
                  {isAuthenticated ? (
                    <>
                      <MenuItem component={Link} to="/chat" onClick={handleMenuClose}>
                        채팅
                      </MenuItem>
                      <MenuItem onClick={handleProfileClick}>프로필</MenuItem>
                      <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
                        로그인
                      </MenuItem>
                      <MenuItem component={Link} to="/register" onClick={handleMenuClose}>
                        회원가입
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/"
                  startIcon={<Home />}
                  sx={{ mr: 1 }}
                >
                  홈
                </Button>
                
                {isAuthenticated ? (
                  <>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/chat"
                      startIcon={<Chat />}
                      sx={{ mr: 1 }}
                    >
                      채팅
                    </Button>
                    
                    <Box sx={{ ml: 1 }}>
                      <IconButton
                        size="large"
                        edge="end"
                        color="inherit"
                        onClick={handleMenuOpen}
                      >
                        {user?.username ? (
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {user.username.charAt(0).toUpperCase()}
                          </Avatar>
                        ) : (
                          <AccountCircle />
                        )}
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={handleProfileClick}>프로필</MenuItem>
                        <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
                      </Menu>
                    </Box>
                  </>
                ) : (
                  <>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/login"
                      sx={{ mr: 1 }}
                    >
                      로그인
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="inherit" 
                      component={Link} 
                      to="/register"
                    >
                      회원가입
                    </Button>
                  </>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 