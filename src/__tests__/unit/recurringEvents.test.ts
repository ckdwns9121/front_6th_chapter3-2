import { describe, expect, it } from 'vitest';
import { generateRepeatDates, generateRecurringEvents } from '../../utils/recurringEvents';
import { RepeatType } from '../../types/recurringEvents';

describe('generateRepeatDates', () => {
  describe('매일 반복', () => {
    it('기본 매일 반복', () => {
      const result = generateRepeatDates('2025-10-01', 'daily', 1, '2025-10-03');
      expect(result).toEqual(['2025-10-01', '2025-10-02', '2025-10-03']);
    });

    it('간격이 2인 매일 반복', () => {
      const result = generateRepeatDates('2025-10-01', 'daily', 2, '2025-10-05');
      expect(result).toEqual(['2025-10-01', '2025-10-03', '2025-10-05']);
    });
  });

  describe('매주 반복', () => {
    it('기본 매주 반복', () => {
      const result = generateRepeatDates('2025-10-01', 'weekly', 1, '2025-10-15');
      expect(result).toEqual(['2025-10-01', '2025-10-08', '2025-10-15']);
    });

    it('간격이 2인 매주 반복', () => {
      const result = generateRepeatDates('2025-10-01', 'weekly', 2, '2025-10-29');
      expect(result).toEqual(['2025-10-01', '2025-10-15', '2025-10-29']);
    });
  });

  describe('매월 반복', () => {
    it('기본 매월 반복', () => {
      const result = generateRepeatDates('2025-10-15', 'monthly', 1, '2025-12-31');
      expect(result).toEqual(['2025-10-15', '2025-11-15', '2025-12-15']);
    });

    it('31일 매월 반복 - 31일이 없는 달은 건너뛴다', () => {
      const result = generateRepeatDates('2025-01-31', 'monthly', 1, '2025-06-30');
      expect(result).toEqual(['2025-01-31', '2025-03-31', '2025-05-31']);
    });

    it('간격이 2인 매월 반복', () => {
      const result = generateRepeatDates('2025-01-15', 'monthly', 2, '2025-07-31');
      expect(result).toEqual(['2025-01-15', '2025-03-15', '2025-05-15', '2025-07-15']);
    });
  });

  describe('매년 반복', () => {
    it('기본 매년 반복', () => {
      const result = generateRepeatDates('2025-10-15', 'yearly', 1, '2027-12-31');
      expect(result).toEqual(['2025-10-15', '2026-10-15', '2027-10-15']);
    });

    it('윤년 29일 매년 반복 - 29일이 없는 해는 건너뛴다', () => {
      const result = generateRepeatDates('2024-02-29', 'yearly', 1, '2030-12-31');
      expect(result).toEqual(['2024-02-29', '2028-02-29']);
    });

    it('간격이 2인 매년 반복', () => {
      const result = generateRepeatDates('2025-06-15', 'yearly', 2, '2031-12-31');
      expect(result).toEqual(['2025-06-15', '2027-06-15', '2029-06-15', '2031-06-15']);
    });
  });

  describe('경계 케이스', () => {
    it('시작일과 종료일이 같은 경우', () => {
      const result = generateRepeatDates('2025-10-01', 'daily', 1, '2025-10-01');
      expect(result).toEqual(['2025-10-01']);
    });

    it('종료일이 시작일보다 이전인 경우', () => {
      const result = generateRepeatDates('2025-10-15', 'daily', 1, '2025-10-10');
      expect(result).toEqual([]);
    });
  });
});

describe('generateRecurringEvents', () => {
  it('매일 반복 이벤트 생성', () => {
    const config = {
      startDate: '2025-10-01',
      endDate: '2025-10-03',
      repeatType: 'daily' as RepeatType,
      maxOccurrences: 5,
    };

    const result = generateRecurringEvents(config);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: 'daily-0-2025-10-01',
      date: '2025-10-01',
      isRecurring: true,
      recurringSeriesId: 'daily-series-2025-10-01',
    });
  });

  it('maxOccurrences 제한 적용', () => {
    const config = {
      startDate: '2025-10-01',
      endDate: '2025-10-10',
      repeatType: 'daily' as RepeatType,
      maxOccurrences: 3,
    };

    const result = generateRecurringEvents(config);

    expect(result).toHaveLength(3);
    expect(result.map((e) => e.date)).toEqual(['2025-10-01', '2025-10-02', '2025-10-03']);
  });
});
