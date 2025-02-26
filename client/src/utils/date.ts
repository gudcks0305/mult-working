/**
 * 날짜 문자열을 시간 형식으로 포맷팅합니다.
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * 날짜 문자열을 날짜 형식으로 포맷팅합니다.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/**
 * 두 날짜 사이의 시간 차이(밀리초)를 반환합니다.
 */
export function getTimeDifference(date1: string, date2: string): number {
  return new Date(date1).getTime() - new Date(date2).getTime();
}

/**
 * 지정된 시간(분) 내에 생성된 메시지인지 확인합니다.
 */
export function isWithinTimeFrame(date1: string, date2: string, minutes: number): boolean {
  const diff = getTimeDifference(date1, date2);
  return Math.abs(diff) < minutes * 60 * 1000;
} 