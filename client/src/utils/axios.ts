import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 로컬 스토리지에서 토큰을 가져와 헤더에 설정
const token = localStorage.getItem('auth-storage');
if (token) {
  try {
    const parsedStorage = JSON.parse(token);
    if (parsedStorage.state && parsedStorage.state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${parsedStorage.state.token}`;
    }
  } catch (e) {
    console.error('Error parsing auth storage:', e);
  }
}

export default api; 