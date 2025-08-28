import { RepeatType } from '../types/recurringEvents';

export const generateRepeatDates = (
  startDate: string,
  repeatType: RepeatType,
  interval: number,
  endDate: string
): string[] => {
  const dates: string[] = [];
  const end = new Date(endDate);
  const start = new Date(startDate);
  const originalDay = start.getDate();
  const originalMonth = start.getMonth();
  const originalYear = start.getFullYear();

  // 첫 번째 날짜 추가
  dates.push(start.toISOString().split('T')[0]);

  let currentYear = originalYear;
  let currentMonth = originalMonth;

  while (true) {
    if (repeatType === 'daily') {
      const nextDate = new Date(start);
      nextDate.setDate(nextDate.getDate() + interval * dates.length);
      if (nextDate > end) break;
      dates.push(nextDate.toISOString().split('T')[0]);
    } else if (repeatType === 'weekly') {
      const nextDate = new Date(start);
      nextDate.setDate(nextDate.getDate() + 7 * interval * dates.length);
      if (nextDate > end) break;
      dates.push(nextDate.toISOString().split('T')[0]);
    } else if (repeatType === 'monthly') {
      // 다음 달 계산
      let nextMonth = currentMonth + interval;
      let nextYear = currentYear;

      if (nextMonth >= 12) {
        nextYear += Math.floor(nextMonth / 12);
        nextMonth = nextMonth % 12;
      }

      // 해당 월에 지정된 일자가 존재하는지 확인
      const lastDayOfMonth = new Date(nextYear, nextMonth + 1, 0).getDate();

      if (originalDay > lastDayOfMonth) {
        // 31일이 없는 달은 건너뛰기
        currentMonth = nextMonth;
        currentYear = nextYear;
        continue; // 다음 반복으로 건너뛰기
      }

      const nextDate = new Date(nextYear, nextMonth, originalDay);
      if (nextDate > end) break;

      dates.push(nextDate.toISOString().split('T')[0]);
      currentMonth = nextMonth;
      currentYear = nextYear;
    } else if (repeatType === 'yearly') {
      const nextYear = currentYear + interval;

      // 해당 해에 지정된 일자가 존재하는지 확인
      const lastDayOfMonth = new Date(nextYear, originalMonth + 1, 0).getDate();
      if (originalDay > lastDayOfMonth) {
        // 해당 해에 해당 일자가 없으면 다음 해로 건너뛰기
        currentYear = nextYear;
        continue;
      }

      const nextDate = new Date(nextYear, originalMonth, originalDay);
      if (nextDate > end) break;
      dates.push(nextDate.toISOString().split('T')[0]);
      currentYear = nextYear;
    }
  }

  return dates;
};
