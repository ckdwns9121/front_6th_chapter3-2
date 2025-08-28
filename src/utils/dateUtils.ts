import { Event } from '../types.ts';

/**
 * 주어진 년도와 월의 일수를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 주어진 날짜가 속한 주의 모든 날짜를 반환합니다.
 */
export function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(sunday);
    nextDate.setDate(sunday.getDate() + i);
    weekDates.push(nextDate);
  }
  return weekDates;
}

export function getWeeksAtMonth(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];

  const initWeek = () => Array(7).fill(null);

  let week: Array<number | null> = initWeek();

  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }

  for (const day of days) {
    const dayIndex = (firstDayOfMonth + day - 1) % 7;
    week[dayIndex] = day;
    if (dayIndex === 6 || day === daysInMonth) {
      weeks.push(week);
      week = initWeek();
    }
  }

  return weeks;
}

export function getEventsForDay(events: Event[], currentDate: Date, date: number): Event[] {
  console.log(`[DEBUG] getEventsForDay called with date: ${date}, events count: ${events.length}`);

  const result = events.filter((event) => {
    const eventDate = new Date(event.date);
    const eventDay = eventDate.getDate();

    // 기본적으로 날짜가 일치하는지 확인 (반복이 아닌 일정)
    if (eventDay === date && event.repeat.type === 'none') {
      console.log(`[DEBUG] Non-recurring event matched: ${event.title} (${event.date})`);
      return true;
    }

    // 주간 반복 일정인 경우 정확한 날짜 계산
    if (event.repeat.type === 'weekly') {
      // 현재 달력에서 해당 날짜의 전체 날짜 계산
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const targetDate = new Date(currentYear, currentMonth, date);

      // 시간을 제거한 순수 날짜로 비교
      const normalizedEventDate = stripTime(eventDate);
      const normalizedTargetDate = stripTime(targetDate);

      console.log(`[DEBUG] Weekly event check: ${event.title}`);
      console.log(
        `[DEBUG] Event date: ${event.date} -> ${normalizedEventDate.toISOString().split('T')[0]}`
      );
      console.log(`[DEBUG] Target date: ${normalizedTargetDate.toISOString().split('T')[0]}`);

      // 시작 날짜 이후인지 확인
      if (normalizedTargetDate < normalizedEventDate) {
        console.log(`[DEBUG] Target date before event start, returning false`);
        return false;
      }

      // 종료 날짜 범위 내에 있는지 확인
      if (event.repeat.endDate) {
        const endDate = new Date(event.repeat.endDate);
        const normalizedEndDate = stripTime(endDate);
        if (normalizedTargetDate > normalizedEndDate) {
          console.log(`[DEBUG] Target date after event end, returning false`);
          return false;
        }
      }

      // 정확히 7일 간격으로 나누어 떨어지는지 확인
      const daysDiff = Math.floor(
        (normalizedTargetDate.getTime() - normalizedEventDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      console.log(`[DEBUG] Days difference: ${daysDiff}, Modulo 7: ${daysDiff % 7}`);

      // 7일 간격으로 나누어 떨어져야 함
      if (daysDiff % 7 !== 0) {
        console.log(`[DEBUG] Not weekly interval, returning false`);
        return false;
      }

      // 주간 간격 설정이 있는 경우 추가 검증
      if (event.repeat.interval && event.repeat.interval > 1) {
        const weeksDiff = daysDiff / 7;
        if (weeksDiff % event.repeat.interval !== 0) {
          console.log(`[DEBUG] Not matching interval, returning false`);
          return false;
        }
      }

      console.log(
        `[DEBUG] Weekly event matched: ${event.title} (${event.date}) -> ${
          normalizedTargetDate.toISOString().split('T')[0]
        }`
      );
      return true;
    }

    return false;
  });

  console.log(`[DEBUG] Filtered result count: ${result.length}`);
  console.log(
    `[DEBUG] Result events:`,
    result.map((e) => ({ id: e.id, title: e.title, date: e.date }))
  );

  // 중복 제거: 같은 ID를 가진 일정은 하나만 반환
  const uniqueEvents = result.filter(
    (event, index, self) => index === self.findIndex((e) => e.id === event.id)
  );

  console.log(`[DEBUG] Unique events count: ${uniqueEvents.length}`);
  console.log(
    `[DEBUG] Unique events:`,
    uniqueEvents.map((e) => ({ id: e.id, title: e.title, date: e.date }))
  );

  return uniqueEvents;
}

export function formatWeek(targetDate: Date) {
  const dayOfWeek = targetDate.getDay();
  const diffToThursday = 4 - dayOfWeek;
  const thursday = new Date(targetDate);
  thursday.setDate(targetDate.getDate() + diffToThursday);

  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;

  const firstDayOfMonth = new Date(thursday.getFullYear(), thursday.getMonth(), 1);

  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

  const weekNumber: number =
    Math.floor((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  return `${year}년 ${month}월 ${weekNumber}주`;
}

/**
 * 주어진 날짜의 월 정보를 "YYYY년 M월" 형식으로 반환합니다.
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  const normalizedDate = stripTime(date);
  const normalizedStart = stripTime(rangeStart);
  const normalizedEnd = stripTime(rangeEnd);

  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}
