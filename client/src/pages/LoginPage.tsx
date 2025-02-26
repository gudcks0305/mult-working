import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { Container, Typography, Box, Paper, Button } from '@mui/material';

const LoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          로그인
        </Typography>
        
        <LoginForm />
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            계정이 없으신가요?
          </Typography>
          <Button 
            component={Link} 
            to="/register" 
            variant="outlined" 
            color="primary"
          >
            회원가입
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage; 