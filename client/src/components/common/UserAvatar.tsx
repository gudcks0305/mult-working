import React from 'react';
import { Avatar } from '@mui/material';

interface UserAvatarProps {
  username: string;
  size?: 'small' | 'medium' | 'large';
  sx?: object;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  size = 'medium',
  sx = {},
}) => {
  // 크기에 따른 스타일 매핑
  const sizeStyles = {
    small: { width: 32, height: 32 },
    medium: { width: 40, height: 40 },
    large: { width: 48, height: 48 },
  };
  
  // 사용자 이름의 첫 글자 추출
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  
  // 이름에 따라 일관된 색상 생성
  const stringToColor = (string: string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  return (
    <Avatar
      sx={{
        ...sizeStyles[size],
        bgcolor: stringToColor(username),
        ...sx
      }}
    >
      {initial}
    </Avatar>
  );
};

export default UserAvatar; 