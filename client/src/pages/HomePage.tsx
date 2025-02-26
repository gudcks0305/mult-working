import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Container, Typography, Box, Button, Paper, Grid } from '@mui/material';
import { Chat as ChatIcon, Person as PersonIcon } from '@mui/icons-material';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          실시간 채팅 애플리케이션
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          친구들과 채팅하고, 새로운 사람들과 대화하세요.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <ChatIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              실시간 채팅
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              빠르고 안전한 실시간 채팅으로 언제 어디서나 대화를 나눌 수 있습니다.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/chat"
                  size="large"
                  startIcon={<ChatIcon />}
                >
                  채팅방으로 이동
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/login"
                  size="large"
                >
                  시작하기
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <PersonIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              계정 관리
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              개인 프로필을 관리하고 채팅 설정을 맞춤화하세요.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  color="secondary"
                  component={Link}
                  to="/profile"
                  size="large"
                  startIcon={<PersonIcon />}
                >
                  프로필로 이동
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="secondary"
                  component={Link}
                  to="/register"
                  size="large"
                >
                  계정 만들기
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage; 