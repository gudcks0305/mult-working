import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  username, 
  size = 'md',
  className = '' 
}) => {
  const firstLetter = username ? username.charAt(0).toUpperCase() : '?';
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
  
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}`} />
      <AvatarFallback>{firstLetter}</AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar; 