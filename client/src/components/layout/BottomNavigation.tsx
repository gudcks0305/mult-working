import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, MessageSquare, User, Settings } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: '홈',
      path: '/'
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: '채팅',
      path: '/chat'
    },
    {
      icon: <User className="h-5 w-5" />,
      label: '프로필',
      path: '/profile'
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: '설정',
      path: '/settings'
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t flex justify-around items-center z-50">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavigation; 