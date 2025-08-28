import { RecurringEventConfig, RecurringEvent } from '../types/recurringEvents';

// 간단한 반복 일정 생성 함수
export const generateRepeatDates = (
  startDate: string,
  repeatType: string,
  interval: number,
  endDate: string
): string[] => {
  const dates: string[] = [];
  const end = new Date(endDate);
  const start = new Date(startDate);
  const originalDay = start.getDate();
  const originalMonth = start.getMonth();

  while (start <= end) {
    dates.push(start.toISOString().split('T')[0]);

    if (repeatType === 'daily') {
      start.setDate(start.getDate() + interval);
    } else if (repeatType === 'weekly') {
      start.setDate(start.getDate() + 7 * interval);
    } else if (repeatType === 'monthly') {
      const nextMonthWithYear = findNextValidMonthWithYear(
        start.getFullYear(),
        start.getMonth(),
        originalDay,
        interval
      );
      start.setTime(
        new Date(nextMonthWithYear.year, nextMonthWithYear.month, originalDay).getTime()
      );
    } else if (repeatType === 'yearly') {
      const nextYear = findNextValidYear(start.getFullYear(), originalMonth, originalDay, interval);
      start.setTime(new Date(nextYear, originalMonth, originalDay).getTime());
    }
  }

  return dates;
};

// 헬퍼 함수들
const findNextValidMonthWithYear = (
  year: number,
  month: number,
  day: number,
  interval: number
): { year: number; month: number } => {
  let nextMonth = month + interval;

  while (new Date(year, nextMonth + 1, 0).getDate() < day) {
    nextMonth += interval;
  }

  const nextYear = year + Math.floor(nextMonth / 12);
  nextMonth = nextMonth % 12;

  return { year: nextYear, month: nextMonth };
};

const findNextValidYear = (year: number, month: number, day: number, interval: number): number => {
  let nextYear = year + interval;

  while (new Date(nextYear, month + 1, 0).getDate() < day) {
    nextYear += interval;
  }

  return nextYear;
};

// 기존 generateRecurringEvents 함수를 간단하게 수정
export function generateRecurringEvents(config: RecurringEventConfig): RecurringEvent[] {
  const { startDate, endDate, repeatType, maxOccurrences } = config;

  // 간단한 방식으로 반복 일정 생성
  const dates = generateRepeatDates(startDate, repeatType, 1, endDate);

  // maxOccurrences 제한 적용
  const limitedDates = dates.slice(0, maxOccurrences);

  return limitedDates.map((date: string, index: number) => ({
    id: `${repeatType}-${index}-${date}`,
    date,
    isRecurring: true,
    recurringSeriesId: `${repeatType}-series-${startDate}`,
  }));
}

// ---------- 단일 수정 함수 ----------
export function modifySingleEvent(
  events: RecurringEvent[],
  index: number,
  modifications: Partial<RecurringEvent>
): RecurringEvent {
  // 입력 검증
  if (!Array.isArray(events)) {
    throw new Error('Events must be an array');
  }

  if (index < 0 || index >= events.length) {
    throw new Error(`Invalid event index: ${index}. Array length: ${events.length}`);
  }

  if (!modifications || typeof modifications !== 'object') {
    throw new Error('Modifications must be a valid object');
  }

  const originalEvent = events[index];

  // 수정된 이벤트 생성 (불변성 유지)
  const modifiedEvent: RecurringEvent = {
    ...originalEvent,
    ...modifications,
    isModified: true,
    modificationDate: new Date().toISOString().split('T')[0],
  };

  // 원본 배열은 변경하지 않고 수정된 이벤트만 반환
  return modifiedEvent;
}

// ---------- 단일 수정 유틸리티 함수들 ----------
export function modifyEventTitle(
  events: RecurringEvent[],
  index: number,
  newTitle: string
): RecurringEvent {
  return modifySingleEvent(events, index, { title: newTitle });
}

export function modifyEventDescription(
  events: RecurringEvent[],
  index: number,
  newDescription: string
): RecurringEvent {
  return modifySingleEvent(events, index, { description: newDescription });
}

export function toggleEventRecurring(events: RecurringEvent[], index: number): RecurringEvent {
  const currentEvent = events[index];
  return modifySingleEvent(events, index, {
    isRecurring: !currentEvent.isRecurring,
  });
}

// ---------- 단일 삭제 함수 ----------
export function deleteSingleEvent(events: RecurringEvent[], index: number): RecurringEvent {
  // 입력 검증
  if (!Array.isArray(events)) {
    throw new Error('Events must be an array');
  }

  if (index < 0 || index >= events.length) {
    throw new Error(`Invalid event index: ${index}. Array length: ${events.length}`);
  }

  const originalEvent = events[index];

  // 삭제된 이벤트 생성 (불변성 유지)
  const deletedEvent: RecurringEvent = {
    ...originalEvent,
    isDeleted: true,
    deletionDate: new Date().toISOString().split('T')[0],
  };

  // 원본 배열은 변경하지 않고 삭제된 이벤트만 반환
  return deletedEvent;
}

// ---------- 단일 삭제 유틸리티 함수들 ----------
export function restoreDeletedEvent(events: RecurringEvent[], index: number): RecurringEvent {
  return modifySingleEvent(events, index, {
    isDeleted: false,
    deletionDate: undefined,
  });
}

export function getActiveEvents(events: RecurringEvent[]): RecurringEvent[] {
  return events.filter((event) => !event.isDeleted);
}

export function getDeletedEvents(events: RecurringEvent[]): RecurringEvent[] {
  return events.filter((event) => event.isDeleted);
}

// ---------- 고급 삭제 관리 함수들 ----------
export function bulkDeleteEvents(events: RecurringEvent[], indices: number[]): RecurringEvent[] {
  // 중복 제거 및 정렬
  const uniqueIndices = [...new Set(indices)].sort((a, b) => a - b);

  // 유효성 검증
  uniqueIndices.forEach((index) => {
    if (index < 0 || index >= events.length) {
      throw new Error(`Invalid event index: ${index}. Array length: ${events.length}`);
    }
  });

  return uniqueIndices.map((index) => deleteSingleEvent(events, index));
}

export function getEventStatusSummary(events: RecurringEvent[]): {
  total: number;
  active: number;
  deleted: number;
  modified: number;
} {
  return {
    total: events.length,
    active: events.filter((event) => !event.isDeleted).length,
    deleted: events.filter((event) => event.isDeleted).length,
    modified: events.filter((event) => event.isModified && !event.isDeleted).length,
  };
}

// ---------- 반복 아이콘 표시 함수들 ----------
export interface RecurringIconInfo {
  shouldShow: boolean;
  iconType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tooltip?: string;
  color?: string;
}

export function getRecurringIconInfo(event: RecurringEvent): RecurringIconInfo {
  // 반복 일정이 아니거나 삭제된 경우 아이콘 숨김
  if (!event.isRecurring || event.isDeleted) {
    return { shouldShow: false };
  }

  // 반복 유형별 아이콘 설정 매핑
  const iconConfigs = {
    daily: { iconType: 'daily' as const, tooltip: '매일 반복', color: '#10B981' },
    weekly: { iconType: 'weekly' as const, tooltip: '매주 반복', color: '#8B5CF6' },
    monthly: { iconType: 'monthly' as const, tooltip: '매월 반복', color: '#3B82F6' },
    yearly: { iconType: 'yearly' as const, tooltip: '매년 반복', color: '#F59E0B' },
  };

  // recurringSeriesId에서 반복 유형 추출
  const seriesId = event.recurringSeriesId;

  for (const [type, config] of Object.entries(iconConfigs)) {
    if (seriesId.startsWith(`${type}-series-`)) {
      return {
        shouldShow: true,
        ...config,
      };
    }
  }

  // 알 수 없는 반복 유형 (기본값)
  return {
    shouldShow: true,
    iconType: 'monthly',
    tooltip: '반복 일정',
    color: '#6B7280',
  };
}

// ---------- 반복 아이콘 유틸리티 함수들 ----------
export function getIconClassName(iconType: string): string {
  const baseClass = 'recurring-icon';
  const typeClass = `icon-${iconType}`;
  return `${baseClass} ${typeClass}`;
}

export function getIconStyle(color: string): Record<string, string> {
  return {
    color: color,
    fontSize: '16px',
    marginRight: '8px',
    cursor: 'pointer',
  };
}

export function shouldShowRecurringIcon(event: RecurringEvent): boolean {
  return getRecurringIconInfo(event).shouldShow;
}
