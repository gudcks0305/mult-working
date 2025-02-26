import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/axios';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

// persist 미들웨어를 사용하여 로컬 스토리지에 상태 저장
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { username, password });
          const { token, user } = response.data;
          
          // 토큰을 저장하고 API 인스턴스의 기본 헤더에 설정
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ 
            token, 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        } catch (error: any) {
          console.error('Login error:', error);
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || '로그인에 실패했습니다.' 
          });
          return false;
        }
      },
      
      register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/register', { username, email, password });
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Register error:', error);
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || '회원가입에 실패했습니다.' 
          });
        }
      },
      
      logout: () => {
        // 토큰 제거 및 API 인스턴스의 헤더에서 인증 정보 제거
        api.defaults.headers.common['Authorization'] = '';
        
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false 
        });
      },
      
      fetchUser: async () => {
        const { token } = get();
        if (!token) return;
        
        set({ isLoading: true });
        try {
          // 토큰을 API 인스턴스의 기본 헤더에 설정
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await api.get('/protected/profile');
          set({ 
            user: response.data, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Fetch user error:', error);
          // 인증 오류인 경우 로그아웃 처리
          if (error.response?.status === 401) {
            get().logout();
          }
          set({ isLoading: false });
        }
      },
      
      clearError: () => set({ error: null }),
      
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // 토큰이 이미 있는지 확인
          const token = localStorage.getItem('token');
          if (!token) {
            set({ isAuthenticated: false, isLoading: false });
            return false;
          }
          
          // 사용자 정보 가져오기
          const response = await api.get('/protected/profile');
          if (response.status === 200) {
            set({ 
              isAuthenticated: true, 
              user: response.data,
              isLoading: false 
            });
            return true;
          }
        } catch (error) {
          console.error('인증 확인 실패:', error);
          localStorage.removeItem('token');
          set({ 
            isAuthenticated: false, 
            user: null,
            isLoading: false 
          });
        }
        return false;
      },
    }),
    {
      name: 'auth-storage', // 로컬 스토리지에 저장될 키 이름
      partialize: (state) => ({ 
        token: state.token,
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// 앱 시작 시 토큰이 있으면 사용자 정보 가져오기
export const initAuth = () => {
  const { token, fetchUser } = useAuthStore.getState();
  if (token) {
    // API 인스턴스의 기본 헤더에 토큰 설정
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchUser();
  }
}; 