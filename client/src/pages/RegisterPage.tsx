import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { Container, Typography, Box, Button } from '@mui/material';

const RegisterPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          회원가입
        </Typography>
        
        <RegisterForm />
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            이미 계정이 있으신가요?
          </Typography>
          <Button 
            component={Link} 
            to="/login" 
            variant="outlined" 
            color="primary"
          >
            로그인
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage; 