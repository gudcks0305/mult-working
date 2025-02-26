import React from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Avatar, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  CircularProgress,
  Alert
} from '@mui/material';
import { Email, CalendarToday, AccountCircle } from '@mui/icons-material';

const ProfilePage: React.FC = () => {
  const { user, isLoading, error, logout } = useAuthStore();
  
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning">사용자 정보를 불러올 수 없습니다.</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', mb: 4 }}>
          <Avatar 
            sx={{ 
              width: 120, 
              height: 120, 
              fontSize: 48, 
              bgcolor: 'primary.main',
              mr: { xs: 0, sm: 4 },
              mb: { xs: 3, sm: 0 }
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {user.username}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1" color="text.secondary">
                가입일: {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          계정 정보
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="유저 ID" 
              secondary={user.id} 
              primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="역할" 
              secondary={user.role || '일반 사용자'} 
              primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="마지막 활동" 
              secondary={new Date(user.updatedAt).toLocaleString()} 
              primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
        </List>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="error" 
            onClick={logout}
          >
            로그아웃
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage; 