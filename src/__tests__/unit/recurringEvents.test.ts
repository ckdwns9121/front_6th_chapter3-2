import { describe, expect, it } from 'vitest';

import { generateRepeatDates } from '../../utils/recurringEvents';

describe('generateRepeatDates - 매일 반복', () => {
  it('매일 반복으로 3일간 날짜를 생성한다', () => {
    const startDate = '2025-10-01';
    const repeatType = 'daily';
    const interval = 1;
    const endDate = '2025-10-03';

    const result = generateRepeatDates(startDate, repeatType, interval, endDate);

    expect(result).toEqual(['2025-10-01', '2025-10-02', '2025-10-03']);
  });

  it('매일 반복으로 1일간 날짜를 생성한다 (시작일과 종료일이 같은 경우)', () => {
    const startDate = '2025-10-01';
    const repeatType = 'daily';
    const interval = 1;
    const endDate = '2025-10-01';

    const result = generateRepeatDates(startDate, repeatType, interval, endDate);

    expect(result).toEqual(['2025-10-01']);
  });
});

describe('generateRepeatDates - 매주 반복', () => {
  it('매주 반복으로 3주간 날짜를 생성한다', () => {
    const startDate = '2025-10-01';
    const repeatType = 'weekly';
    const interval = 1;
    const endDate = '2025-10-15';

    const result = generateRepeatDates(startDate, repeatType, interval, endDate);

    expect(result).toEqual(['2025-10-01', '2025-10-08', '2025-10-15']);
  });

  it('매주 반복으로 1주간 날짜를 생성한다 (시작일과 종료일이 같은 경우)', () => {
    const startDate = '2025-10-01';
    const repeatType = 'weekly';
    const interval = 1;
    const endDate = '2025-10-01';

    const result = generateRepeatDates(startDate, repeatType, interval, endDate);

    expect(result).toEqual(['2025-10-01']);
  });
});

describe('generateRepeatDates - 매월 반복', () => {
  it('매월 반복으로 3개월간 날짜를 생성한다', () => {
    const startDate = '2025-10-15';
    const repeatType = 'monthly';
    const interval = 1;
    const endDate = '2025-12-31';

    const result = generateRepeatDates(startDate, repeatType, interval, endDate);

    expect(result).toEqual(['2025-10-15', '2025-11-15', '2025-12-15']);
  });

  it('매월 반복으로 1개월간 날짜를 생성한다 (시작일과 종료일이 같은 경우)', () => {
    const startDate = '2025-10-15';
    const repeatType = 'monthly';
    const interval = 1;
    const endDate = '2025-10-15';

    const result = generateRepeatDates(startDate, repeatType, interval, endDate);

    expect(result).toEqual(['2025-10-15']);
  });

  it('31일 매월 반복 - 31일이 없는 달은 건너뛴다', () => {
    const startDate = '2025-01-31';
    const repeatType = 'monthly';
    const interval = 1;
    const endDate = '2025-06-30';

    const result = generateRepeatDates(startDate, repeatType, interval, endDate);

    expect(result).toEqual(['2025-01-31', '2025-03-31', '2025-05-31']);
  });
});

describe('generateRepeatDates - 매년 반복', () => {
  it('매년 반복으로 3년간 날짜를 생성한다', () => {
    const startDate = '2025-10-15';
    const repeatType = 'yearly';
    const interval = 1;
    const endDate = '2027-12-31';

    const result = generateRepeatDates(startDate, repeatType, interval, endDate);

    expect(result).toEqual(['2025-10-15', '2026-10-15', '2027-10-15']);
  });

  it('매년 반복으로 1년간 날짜를 생성한다 (시작일과 종료일이 같은 경우)', () => {
    const startDate = '2025-10-15';
    const repeatType = 'yearly';
    const interval = 1;
    const endDate = '2025-10-15';

    const result = generateRepeatDates(startDate, repeatType, interval, endDate);

    expect(result).toEqual(['2025-10-15']);
  });

  it('윤년 29일 매년 반복 - 29일이 없는 해는 건너뛴다', () => {
    const startDate = '2024-02-29';
    const repeatType = 'yearly';
    const interval = 1;
    const endDate = '2030-12-31';

    const result = generateRepeatDates(startDate, repeatType, interval, endDate);

    expect(result).toEqual(['2024-02-29', '2028-02-29']);
  });
});

describe('generateRepeatDates - 반복 종료 조건', () => {
  it('특정 날짜까지 반복을 제한한다 (매일 반복)', () => {
    const startDate = '2025-01-01';
    const repeatType = 'daily';
    const interval = 1;
    const repeatEndDate = '2025-01-10';

    const result = generateRepeatDates(startDate, repeatType, interval, repeatEndDate);

    expect(result).toHaveLength(10);
    expect(result[0]).toBe('2025-01-01');
    expect(result[result.length - 1]).toBe('2025-01-10');
  });

  it('특정 날짜까지 반복을 제한한다 (매주 반복)', () => {
    const startDate = '2025-01-01';
    const repeatType = 'weekly';
    const interval = 1;
    const repeatEndDate = '2025-01-29';

    const result = generateRepeatDates(startDate, repeatType, interval, repeatEndDate);

    expect(result).toHaveLength(5);
    expect(result[0]).toBe('2025-01-01');
    expect(result[1]).toBe('2025-01-08');
    expect(result[2]).toBe('2025-01-15');
    expect(result[3]).toBe('2025-01-22');
    expect(result[4]).toBe('2025-01-29');
  });

  it('특정 날짜까지 반복을 제한한다 (매월 반복)', () => {
    const startDate = '2025-01-15';
    const repeatType = 'monthly';
    const interval = 1;
    const repeatEndDate = '2025-06-15';

    const result = generateRepeatDates(startDate, repeatType, interval, repeatEndDate);

    expect(result).toHaveLength(6);
    expect(result[0]).toBe('2025-01-15');
    expect(result[1]).toBe('2025-02-15');
    expect(result[2]).toBe('2025-03-15');
    expect(result[3]).toBe('2025-04-15');
    expect(result[4]).toBe('2025-05-15');
    expect(result[5]).toBe('2025-06-15');
  });

  it('특정 날짜까지 반복을 제한한다 (매년 반복)', () => {
    const startDate = '2025-01-15';
    const repeatType = 'yearly';
    const interval = 1;
    const repeatEndDate = '2029-01-15';

    const result = generateRepeatDates(startDate, repeatType, interval, repeatEndDate);

    expect(result).toHaveLength(5);
    expect(result[0]).toBe('2025-01-15');
    expect(result[1]).toBe('2026-01-15');
    expect(result[2]).toBe('2027-01-15');
    expect(result[3]).toBe('2028-01-15');
    expect(result[4]).toBe('2029-01-15');
  });

  it('반복 종료일이 시작일보다 이전이면 시작일만 반환한다', () => {
    const startDate = '2025-01-15';
    const repeatType = 'daily';
    const interval = 1;
    const repeatEndDate = '2025-01-10'; // 시작일보다 이전

    const result = generateRepeatDates(startDate, repeatType, interval, repeatEndDate);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('2025-01-15');
  });

  it('반복 종료일이 없으면 기본적으로 계속 반복한다', () => {
    const startDate = '2025-01-01';
    const repeatType = 'daily';
    const interval = 1;
    // repeatEndDate 없음

    const result = generateRepeatDates(startDate, repeatType, interval);

    // 기본적으로는 계속 반복하지만, 실제로는 무한 루프 방지를 위해 적절한 제한 필요
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toBe('2025-01-01');
  });
});
