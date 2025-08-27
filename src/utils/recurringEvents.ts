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

  const start = parseISODateUTC(startDate); // 00:00:00Z
  const end = parseISODateUTC(endDate); // 00:00:00Z

  const startDay = start.getUTCDate();
  const startIsEOM = isEndOfMonthUTC(start);

  let year = start.getUTCFullYear();
  let month = start.getUTCMonth(); // 0-11
  let count = 0;

  while (true) {
    if (count >= maxOccurrences) break;

    // 대상 월의 일수
    const dim = daysInMonthUTC(year, month);

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
