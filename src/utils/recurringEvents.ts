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

  // 루프가 끝나면 누적된 nextMonth를 기준으로 실제 연·월을 단 한 번에 계산
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
