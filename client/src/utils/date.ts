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

/**
 * 메시지 시간을 포맷팅하는 함수
 * 오늘이면 시:분, 어제면 어제, 일주일 이내면 요일, 그 외에는 연-월-일
 */
export const formatMessageTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // 오늘인지 확인
  const isToday = date.toDateString() === now.toDateString();
  
  // 어제인지 확인
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  // 일주일 이내인지 확인
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);
  const isWithinWeek = date > oneWeekAgo;
  
  // 형식 결정
  if (isToday) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  } else if (isYesterday) {
    return '어제';
  } else if (isWithinWeek) {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${weekdays[date.getDay()]}요일`;
  } else {
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}; 