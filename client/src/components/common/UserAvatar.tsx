import React from 'react';

interface UserAvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  size = 'md',
  className = '',
}) => {
  // 크기에 따른 스타일 매핑
  const sizeStyles = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  // 사용자 이름의 첫 글자 추출
  const initial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={`
        rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {initial}
    </div>
  );
};

export default UserAvatar; 