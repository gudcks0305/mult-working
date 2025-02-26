import { Message } from '../types/message';
import { isWithinTimeFrame } from './date';

interface MessageGroup {
  userId: number;
  username: string;
  messages: Message[];
  isCurrentUser: boolean;
}

/**
 * 메시지를 그룹화합니다.
 * 같은 사용자가 일정 시간 내에 보낸 연속된 메시지를 하나의 그룹으로 묶습니다.
 */
export function groupMessages(messages: Message[], currentUserId?: number): MessageGroup[] {
  return messages.reduce((groups: MessageGroup[], msg: Message, index: number) => {
    // 이전 메시지와 같은 사용자인지 확인
    const prevMsg = messages[index - 1];
    const isSameUser = prevMsg && prevMsg.userId === msg.userId;
    
    // 5분 이내의 같은 사용자 메시지는 그룹화
    if (isSameUser && isWithinTimeFrame(msg.createdAt, prevMsg.createdAt, 5)) {
      const lastGroup = groups[groups.length - 1];
      lastGroup.messages.push(msg);
    } else {
      groups.push({
        userId: msg.userId,
        username: msg.username,
        messages: [msg],
        isCurrentUser: msg.userId === currentUserId
      });
    }
    
    return groups;
  }, []);
}

/**
 * 메시지 배열을 시간순으로 정렬합니다.
 */
export function sortMessagesByTime(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
} 