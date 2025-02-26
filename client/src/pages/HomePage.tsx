import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, ArrowRight } from "lucide-react";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const features = [
    {
      title: "실시간 채팅",
      description: "웹소켓을 통한 빠르고 안정적인 실시간 메시지 전송",
      icon: <MessageSquare className="h-12 w-12 text-primary" />
    },
    {
      title: "그룹 채팅방",
      description: "여러 사용자와 함께하는 그룹 채팅방 지원",
      icon: <Users className="h-12 w-12 text-primary" />
    },
    {
      title: "간편한 사용법",
      description: "직관적인 인터페이스로 누구나 쉽게 사용 가능",
      icon: <ArrowRight className="h-12 w-12 text-primary" />
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="py-12 flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold mb-4">
          실시간 채팅 애플리케이션
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          간단하고 빠른 실시간 채팅 서비스를 경험해보세요.
          언제 어디서나 친구들과 소통할 수 있습니다.
        </p>
        
        {isAuthenticated ? (
          <Button 
            size="lg"
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2"
          >
            <span>채팅방으로 이동</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
            >
              로그인
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/register')}
            >
              회원가입
            </Button>
          </div>
        )}
      </section>
      
      {/* 기능 소개 섹션 */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">
          주요 기능
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-center">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* CTAs */}
      <section className="py-12 text-center">
        <Card className="bg-muted">
          <CardContent className="py-8">
            <h2 className="text-3xl font-bold mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              실시간으로 친구들과 소통하고 새로운 인연을 만들어보세요.
              간단한 회원가입 후 바로 이용할 수 있습니다.
            </p>
            
            {isAuthenticated ? (
              <Button 
                size="lg"
                onClick={() => navigate('/chat')}
              >
                채팅방으로 이동
              </Button>
            ) : (
              <Button 
                size="lg"
                onClick={() => navigate('/register')}
              >
                무료로 시작하기
              </Button>
            )}
          </CardContent>
        </Card>
      </section>
      
      {/* 푸터 */}
      <footer className="py-8 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2023 채팅 애플리케이션. 모든 권리 보유.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link to="/terms" className="text-sm hover:underline">이용약관</Link>
            <Link to="/privacy" className="text-sm hover:underline">개인정보처리방침</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 