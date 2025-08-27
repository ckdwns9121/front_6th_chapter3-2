import { RecurringEventConfig, RecurringEvent } from '../types/recurringEvents';

export function generateRecurringEvents(config: RecurringEventConfig): RecurringEvent[] {
  const { startDate, endDate, repeatType, maxOccurrences } = config;

  if (repeatType === 'daily') {
    return generateDailyRecurringEvents(startDate, endDate, maxOccurrences);
  } else if (repeatType === 'weekly') {
    return generateWeeklyRecurringEvents(startDate, endDate, maxOccurrences);
  } else if (repeatType === 'monthly') {
    return generateMonthlyRecurringEvents(startDate, endDate, maxOccurrences);
  } else if (repeatType === 'yearly') {
    return generateYearlyRecurringEvents(startDate, endDate, maxOccurrences);
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
  let currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);
  let occurrenceCount = 0;

  while (currentDate <= endDateObj && occurrenceCount < maxOccurrences) {
    events.push({
      id: `monthly-${occurrenceCount}-${currentDate.toISOString()}`,
      date: currentDate.toISOString().split('T')[0],
      isRecurring: true,
      recurringSeriesId: `monthly-series-${startDate}`,
    });

    occurrenceCount++;

    // 다음 달 계산
    currentDate = addMonths(currentDate, 1);
  }

  return events;
}

function generateYearlyRecurringEvents(
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
      id: `yearly-${occurrenceCount}-${currentDate.toISOString()}`,
      date: currentDate.toISOString().split('T')[0],
      isRecurring: true,
      recurringSeriesId: `yearly-series-${startDate}`,
    });

    occurrenceCount++;

    // 다음 년도 계산
    currentDate = addYears(currentDate, 1);
  }

  return events;
}

// 월 추가 헬퍼 함수
function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  const originalDay = date.getDate(); // 원래 날짜의 일자 저장

  // 더 정확한 월간 계산을 위해 setFullYear와 setMonth 사용
  const targetYear = newDate.getFullYear();
  const targetMonth = newDate.getMonth() + months;

  newDate.setFullYear(targetYear, targetMonth, 1); // 해당 월의 1일로 설정
  newDate.setDate(originalDay); // 원래 일자로 설정

  // 31일 처리: 원래 날짜가 31일이고 대상 월이 30일 이하인 경우
  if (originalDay === 31 && newDate.getDate() !== 31) {
    newDate.setDate(0); // 해당 월의 마지막 날로 설정
  }

  return newDate;
}

function addYears(date: Date, years: number): Date {
  const newDate = new Date(date);
  const originalMonth = date.getMonth();
  const originalDay = date.getDate();

  newDate.setFullYear(newDate.getFullYear() + years);

  // 윤년 29일 처리: 원래 날짜가 2월 29일이고 대상 해가 윤년이 아닌 경우
  if (originalMonth === 1 && originalDay === 29 && !isLeapYear(newDate.getFullYear())) {
    newDate.setDate(28); // 2월 28일로 설정
  }

  return newDate;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
