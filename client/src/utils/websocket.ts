import { WEBSOCKET_RECONNECT_MAX_ATTEMPTS } from '../constants';

/**
 * 웹소켓 URL을 생성합니다.
 */
export function createWebSocketUrl(token: string): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  // API URL에서 호스트 추출 또는 현재 호스트 사용
  let host;
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl) {
    // API URL에서 프로토콜 제거 및 경로 유지
    host = apiUrl.replace(/^https?:\/\//, '');
  } else {
    // 현재 호스트 + /api 사용
    host = `${window.location.host}/api`;
  }
  
  // 최종 웹소켓 URL
  return `${protocol}//${host}/ws?token=${token}`;
}

/**
 * 지수 백오프를 사용하여 재연결 지연 시간을 계산합니다.
 */
export function calculateReconnectDelay(attempt: number): number {
  return Math.min(Math.pow(2, attempt) * 1000, 30000); // 최대 30초
}

/**
 * 재연결 시도 횟수가 최대값을 초과했는지 확인합니다.
 */
export function shouldRetryConnection(attempt: number): boolean {
  return attempt < WEBSOCKET_RECONNECT_MAX_ATTEMPTS;
} 