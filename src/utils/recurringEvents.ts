import { RecurringEventConfig, RecurringEvent, YearlyFeb29Policy } from '../types/recurringEvents';

export function generateRecurringEvents(config: RecurringEventConfig): RecurringEvent[] {
  const { startDate, endDate, repeatType, maxOccurrences } = config;

  if (repeatType === 'daily') {
    return generateDailyRecurringEvents(startDate, endDate, maxOccurrences);
  } else if (repeatType === 'weekly') {
    return generateWeeklyRecurringEvents(startDate, endDate, maxOccurrences);
  } else if (repeatType === 'monthly') {
    return generateMonthlyRecurringEvents(startDate, endDate, maxOccurrences);
  } else if (repeatType === 'yearly') {
    return generateYearlyRecurringEvents(
      startDate,
      endDate,
      maxOccurrences,
      config.policies?.yearlyFeb29Policy ?? 'leap-only' // 기본: 윤년에만
    );
  }

  return [];
}

function generateDailyRecurringEvents(
  startDate: string,
  endDate: string,
  maxOccurrences: number
): RecurringEvent[] {
  const events: RecurringEvent[] = [];
  let currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);
  let occurrenceCount = 0;

  while (currentDate <= endDateObj && occurrenceCount < maxOccurrences) {
    events.push({
      id: `daily-${occurrenceCount}-${currentDate.toISOString()}`,
      date: currentDate.toISOString().split('T')[0],
      isRecurring: true,
      recurringSeriesId: `daily-series-${startDate}`,
    });

    occurrenceCount++;

    // 다음 날짜 계산
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return events;
}

function generateWeeklyRecurringEvents(
  startDate: string,
  endDate: string,
  maxOccurrences: number
): RecurringEvent[] {
  const events: RecurringEvent[] = [];
  let currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);
  let occurrenceCount = 0;

  while (currentDate <= endDateObj && occurrenceCount < maxOccurrences) {
    events.push({
      id: `weekly-${occurrenceCount}-${currentDate.toISOString()}`,
      date: currentDate.toISOString().split('T')[0],
      isRecurring: true,
      recurringSeriesId: `weekly-series-${startDate}`,
    });

    occurrenceCount++;

    // 다음 주 계산 (7일 후)
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return events;
}

function generateMonthlyRecurringEvents(
  startDate: string,
  endDate: string,
  maxOccurrences: number
): RecurringEvent[] {
  const events: RecurringEvent[] = [];

  const start = parseISODateUTC(startDate); // 00:00:00Z
  const end = parseISODateUTC(endDate); // 00:00:00Z

  const startDay = start.getUTCDate();
  const startIsEOM = isEndOfMonthUTC(start);

  let year = start.getUTCFullYear();
  let month = start.getUTCMonth(); // 0-11
  let count = 0;

  // ---------- 31일 처리 헬퍼 함수 ----------
  const shouldSkipMonth = (startDay: number, daysInMonth: number): boolean => {
    return startDay === 31 && daysInMonth < 31;
  };

  const moveToNextMonth = (): void => {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  };

  while (true) {
    if (count >= maxOccurrences) break;

    // 대상 월의 일수
    const dim = daysInMonthUTC(year, month);

    // 31일 처리: 31일에 시작한 경우 31일이 없는 달은 건너뛰기
    if (shouldSkipMonth(startDay, dim)) {
      moveToNextMonth();
      continue;
    }

    // 말일 앵커 유지 or min(원래 일, 대상 월 일수)
    const day = startIsEOM ? dim : Math.min(startDay, dim);

    const occurrence = new Date(Date.UTC(year, month, day)); // 항상 UTC 기반
    if (occurrence.getTime() > end.getTime()) break;

    events.push({
      id: `monthly-${count}-${occurrence.toISOString()}`,
      date: formatDateUTC(occurrence), // 'YYYY-MM-DD' (UTC)
      isRecurring: true,
      recurringSeriesId: `monthly-series-${startDate}`,
    });

    // 다음 달
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }

    count += 1;
  }

  return events;
}

function generateYearlyRecurringEvents(
  startDate: string,
  endDate: string,
  maxOccurrences: number,
  feb29Policy: YearlyFeb29Policy = 'leap-only'
): RecurringEvent[] {
  const events: RecurringEvent[] = [];

  const start = parseISODateUTC(startDate); // 00:00:00Z
  const end = parseISODateUTC(endDate); // 00:00:00Z

  const anchorMonth = start.getUTCMonth(); // 0-11
  const anchorDay = start.getUTCDate(); // e.g. 29 (윤년 시작)

  let year = start.getUTCFullYear();
  let count = 0;

  const isFeb29Anchor = anchorMonth === 1 && anchorDay === 29;

  while (count < maxOccurrences) {
    // 포함여부 결정
    let include = true;
    if (isFeb29Anchor) {
      if (feb29Policy === 'leap-only') {
        include = isLeapYear(year);
      } else if (feb29Policy === 'leap-400-only') {
        include = year % 400 === 0;
      } else if (feb29Policy === 'clip') {
        include = true; // 항상 포함 (평년은 2/28로 대체)
      }
    }

    if (!include) {
      year += 1;
      continue;
    }

    // 해당 해 anchorMonth의 말일
    const dim = daysInMonthUTC(year, anchorMonth);
    const day = Math.min(anchorDay, dim); // 2/29 → 평년 28, 윤년 29 유지

    const occurrence = new Date(Date.UTC(year, anchorMonth, day));
    if (occurrence.getTime() > end.getTime()) break;

    events.push({
      id: `yearly-${count}-${occurrence.toISOString()}`,
      date: formatDateUTC(occurrence), // 'YYYY-MM-DD'
      isRecurring: true,
      recurringSeriesId: `yearly-series-${startDate}`,
    });

    year += 1;
    count += 1;
  }

  return events;
}

// ---------- UTC 유틸 ----------
function parseISODateUTC(yyyyMmDd: string): Date {
  // 'YYYY-MM-DD' → 항상 UTC 자정
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDateUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getUTCDate()}`.padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function daysInMonthUTC(year: number, monthZeroBased: number): number {
  // 다음달 0일 = 해당달 말일
  return new Date(Date.UTC(year, monthZeroBased + 1, 0)).getUTCDate();
}

function isEndOfMonthUTC(d: Date): boolean {
  return d.getUTCDate() === daysInMonthUTC(d.getUTCFullYear(), d.getUTCMonth());
}

// ---------- 윤년 판별 함수 ----------
function isLeapYear(year: number): boolean {
  // 4로 나누어떨어지고, 100으로 나누어떨어지지 않거나
  // 400으로 나누어떨어지는 해가 윤년
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
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
