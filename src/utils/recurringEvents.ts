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

  const start = parseISODateUTC(startDate); // 00:00:00Z
  const end = parseISODateUTC(endDate); // 00:00:00Z

  const anchorMonth = start.getUTCMonth(); // 0-11
  const anchorDay = start.getUTCDate(); // e.g. 29 (윤년 시작)

  let year = start.getUTCFullYear();
  let count = 0;

  while (count < maxOccurrences) {
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
