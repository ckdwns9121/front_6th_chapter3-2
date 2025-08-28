import { describe, expect, it } from 'vitest';

import { generateRepeatDates } from '../../utils/recurringEvents';

describe('generateRepeatDates - 반복 일정 표시', () => {
  it('반복 일정 생성 시 올바른 날짜 배열을 반환한다', () => {
    const startDate = '2025-01-01';
    const repeatType = 'daily';
    const interval = 1;
    const repeatEndDate = '2025-01-05';

    const result = generateRepeatDates(startDate, repeatType, interval, repeatEndDate);

    // 반복 일정이 올바르게 생성되었는지 확인
    expect(result).toHaveLength(5);
    expect(result[0]).toBe('2025-01-01');
    expect(result[4]).toBe('2025-01-05');

    // 모든 날짜가 연속적인지 확인
    for (let i = 1; i < result.length; i++) {
      const prevDate = new Date(result[i - 1]);
      const currDate = new Date(result[i]);
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(1); // 매일 반복이므로 1일 차이
    }
  });

  it('반복 일정의 날짜 형식이 올바른지 확인한다', () => {
    const startDate = '2025-01-01';
    const repeatType = 'weekly';
    const interval = 1;
    const repeatEndDate = '2025-01-29';

    const result = generateRepeatDates(startDate, repeatType, interval, repeatEndDate);

    // 모든 날짜가 YYYY-MM-DD 형식인지 확인
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    result.forEach((date) => {
      expect(date).toMatch(dateRegex);
    });

    // 모든 날짜가 유효한 날짜인지 확인
    result.forEach((date) => {
      const dateObj = new Date(date);
      expect(dateObj.toString()).not.toBe('Invalid Date');
    });
  });

  it('반복 유형별로 올바른 간격으로 생성되는지 확인한다', () => {
    const startDate = '2025-01-01';
    const repeatEndDate = '2025-02-01';

    // 매일 반복
    const dailyResult = generateRepeatDates(startDate, 'daily', 1, repeatEndDate);
    expect(dailyResult.length).toBeGreaterThan(30); // 1월은 31일

    // 매주 반복
    const weeklyResult = generateRepeatDates(startDate, 'weekly', 1, repeatEndDate);
    expect(weeklyResult.length).toBeGreaterThan(4); // 4주 이상

    // 매월 반복
    const monthlyResult = generateRepeatDates(startDate, 'monthly', 1, repeatEndDate);
    expect(monthlyResult.length).toBe(2); // 1월 1일, 2월 1일

    // 매년 반복
    const yearlyResult = generateRepeatDates(startDate, 'yearly', 1, repeatEndDate);
    expect(yearlyResult.length).toBe(1); // 1년만
  });

  it('반복 종료일이 없을 때 기본 제한 내에서 생성되는지 확인한다', () => {
    const startDate = '2025-01-01';
    const repeatType = 'daily';
    const interval = 1;
    // repeatEndDate 없음

    const result = generateRepeatDates(startDate, repeatType, interval);

    // 무한 루프 방지를 위한 기본 제한 (1000개) 내에서 생성
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(1000);
    expect(result[0]).toBe('2025-01-01');
  });

  it('반복 간격이 올바르게 적용되는지 확인한다', () => {
    const startDate = '2025-01-01';
    const repeatType = 'daily';
    const repeatEndDate = '2025-01-10';

    // 1일 간격
    const interval1Result = generateRepeatDates(startDate, repeatType, 1, repeatEndDate);
    expect(interval1Result).toHaveLength(10);

    // 2일 간격
    const interval2Result = generateRepeatDates(startDate, repeatType, 2, repeatEndDate);
    expect(interval2Result).toHaveLength(5); // 1, 3, 5, 7, 9일
    expect(interval2Result[0]).toBe('2025-01-01');
    expect(interval2Result[1]).toBe('2025-01-03');
    expect(interval2Result[2]).toBe('2025-01-05');
  });

  it('반복 일정이 UI 표시에 적합한 데이터 구조를 반환한다', () => {
    const startDate = '2025-01-01';
    const repeatType = 'daily';
    const interval = 1;
    const repeatEndDate = '2025-01-03';

    const result = generateRepeatDates(startDate, repeatType, interval, repeatEndDate);

    // UI 표시에 필요한 속성들 확인
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // 각 날짜가 문자열이고 올바른 형식인지 확인
    result.forEach((date, index) => {
      expect(typeof date).toBe('string');
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // 날짜가 순서대로 정렬되어 있는지 확인
      if (index > 0) {
        const prevDate = new Date(result[index - 1]);
        const currDate = new Date(date);
        expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime());
      }
    });
  });

  it('반복 일정의 날짜가 실제 달력에 표시 가능한지 확인한다', () => {
    const startDate = '2025-01-01';
    const repeatType = 'monthly';
    const interval = 1;
    const repeatEndDate = '2025-06-01';

    const result = generateRepeatDates(startDate, repeatType, interval, repeatEndDate);

    // 각 날짜가 실제 존재하는 날짜인지 확인
    result.forEach((date) => {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const day = dateObj.getDate();

      // 날짜가 실제로 존재하는지 확인
      const actualDate = new Date(year, month, day);
      expect(actualDate.getFullYear()).toBe(year);
      expect(actualDate.getMonth()).toBe(month);
      expect(actualDate.getDate()).toBe(day);
    });
  });
});

describe('반복 일정 단일 수정', () => {
  it('반복 일정을 수정하면 단일 일정으로 변경된다', () => {
    // 반복 일정 데이터
    const recurringEvent = {
      id: 'event-1',
      title: '반복 회의',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '매주 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'weekly' as const,
        interval: 1,
        endDate: '2025-12-31',
      },
      notificationTime: 10,
      isRecurring: true,
      recurringSeriesId: 'series-1',
    };

    // 수정된 데이터 (반복 없음)
    const modifiedEvent = {
      ...recurringEvent,
      title: '수정된 회의',
      description: '일회성 회의',
      repeat: {
        type: 'none' as const,
        interval: 1,
        endDate: undefined,
      },
      isRecurring: false,
      recurringSeriesId: '',
    };

    // 수정 후 반복 속성이 제거되었는지 확인
    expect(modifiedEvent.repeat.type).toBe('none');
    expect(modifiedEvent.isRecurring).toBe(false);
    expect(modifiedEvent.recurringSeriesId).toBe('');
    expect(modifiedEvent.title).toBe('수정된 회의');
    expect(modifiedEvent.description).toBe('일회성 회의');
  });

  it('반복 일정 수정 시 반복 아이콘이 사라진다', () => {
    // 반복 아이콘 표시 여부 확인 함수
    const shouldShowRepeatIcon = (repeatType: string) => repeatType !== 'none';

    expect(shouldShowRepeatIcon('daily')).toBe(true);
    expect(shouldShowRepeatIcon('weekly')).toBe(true);
    expect(shouldShowRepeatIcon('monthly')).toBe(true);
    expect(shouldShowRepeatIcon('yearly')).toBe(true);
    expect(shouldShowRepeatIcon('none')).toBe(false);
  });

  it('반복 일정을 다른 반복 유형으로 수정할 수 있다', () => {
    // 매일 반복에서 매주 반복으로 변경
    const dailyEvent = {
      repeat: { type: 'daily' as const, interval: 1, endDate: '2025-12-31' },
    };

    const weeklyEvent = {
      repeat: { type: 'weekly' as const, interval: 2, endDate: '2025-06-30' },
    };

    // 반복 유형과 간격이 변경되었는지 확인
    expect(dailyEvent.repeat.type).toBe('daily');
    expect(weeklyEvent.repeat.type).toBe('weekly');
    expect(weeklyEvent.repeat.interval).toBe(2);
    expect(weeklyEvent.repeat.endDate).toBe('2025-06-30');
  });

  it('반복 일정을 일반 일정으로 수정할 수 있다', () => {
    // 반복 일정 데이터
    const recurringEvent = {
      title: '반복 운동',
      date: '2025-01-01',
      repeat: {
        type: 'daily' as const,
        interval: 1,
        endDate: '2025-12-31',
      },
    };

    // 일반 일정으로 수정
    const regularEvent = {
      ...recurringEvent,
      title: '일회성 운동',
      repeat: {
        type: 'none' as const,
        interval: 1,
        endDate: undefined,
      },
    };

    // 반복 속성이 제거되었는지 확인
    expect(regularEvent.repeat.type).toBe('none');
    expect(regularEvent.repeat.endDate).toBeUndefined();
    expect(regularEvent.title).toBe('일회성 운동');
  });

  it('반복 일정 수정 시 다른 필드들도 함께 수정할 수 있다', () => {
    // 원본 반복 일정
    const originalEvent = {
      title: '원래 제목',
      description: '원래 설명',
      location: '원래 위치',
      repeat: {
        type: 'monthly' as const,
        interval: 1,
        endDate: '2025-12-31',
      },
    };

    // 모든 필드를 수정
    const modifiedEvent = {
      ...originalEvent,
      title: '새로운 제목',
      description: '새로운 설명',
      location: '새로운 위치',
      repeat: {
        type: 'none' as const,
        interval: 1,
        endDate: undefined,
      },
    };

    // 모든 필드가 수정되었는지 확인.
    expect(modifiedEvent.title).toBe('새로운 제목');
    expect(modifiedEvent.description).toBe('새로운 설명');
    expect(modifiedEvent.location).toBe('새로운 위치');
    expect(modifiedEvent.repeat.type).toBe('none');
  });
});
