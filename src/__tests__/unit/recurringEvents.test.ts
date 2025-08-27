import { generateRecurringEvents } from '../../utils/recurringEvents';
import { RepeatType } from '../../types/recurringEvents';

describe('매일 반복', () => {
  it('TC-001: 2025-01-01부터 2025-01-05까지 매일 반복 일정을 생성한다', () => {
    // Given
    const config = {
      startDate: '2025-01-01',
      endDate: '2025-01-05',
      repeatType: 'daily' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(5);
    expect(events[0].date).toBe('2025-01-01');
    expect(events[4].date).toBe('2025-01-05');

    // 연속된 날짜 확인
    for (let i = 1; i < events.length; i++) {
      const prevDate = new Date(events[i - 1].date);
      const currDate = new Date(events[i].date);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(1);
    }
  });

  it('TC-002: 반복 횟수 제한을 초과하지 않도록 제한한다', () => {
    // Given
    const config = {
      startDate: '2025-01-01',
      endDate: '2025-12-31', // 1년
      repeatType: 'daily' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(10); // maxOccurrences 제한
    expect(events[9].date).toBe('2025-01-10'); // 마지막 일정
  });

  it('TC-003: 반복 종료 조건을 올바르게 적용한다', () => {
    // Given
    const config = {
      startDate: '2025-01-01',
      endDate: '2025-10-30',
      repeatType: 'daily' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(10); // maxOccurrences 제한
    expect(events[9].date).toBe('2025-01-10'); // 2025-10-30 이전
  });
});

describe('매주 반복', () => {
  it('TC-004: 2025-01-01부터 2025-01-29까지 매주 반복 일정을 생성한다', () => {
    // Given
    const config = {
      startDate: '2025-01-01',
      endDate: '2025-01-29',
      repeatType: 'weekly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(5);
    expect(events[0].date).toBe('2025-01-01');
    expect(events[4].date).toBe('2025-01-29');

    // 7일 간격 확인
    for (let i = 1; i < events.length; i++) {
      const prevDate = new Date(events[i - 1].date);
      const currDate = new Date(events[i].date);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(7);
    }
  });

  it('TC-005: 주간 계산 로직의 정확성과 경계값 처리를 검증한다', () => {
    // Given
    const config = {
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      repeatType: 'weekly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(10); // maxOccurrences 제한
    expect(events[9].date).toBe('2025-03-05'); // 10주 후 (1월 1일 + 63일)

    // 모든 일정이 정확히 7일 간격으로 생성됨
    for (let i = 1; i < events.length; i++) {
      const prevDate = new Date(events[i - 1].date);
      const currDate = new Date(events[i].date);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(7);
    }
  });

  it('TC-006: 월말과 연말 경계에서의 주간 반복 처리를 검증한다', () => {
    // Given
    const config = {
      startDate: '2025-01-28',
      endDate: '2025-02-25',
      repeatType: 'weekly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(5);
    expect(events[0].date).toBe('2025-01-28');
    expect(events[4].date).toBe('2025-02-25');

    // 월 경계를 넘어서도 정확한 7일 간격 유지
    for (let i = 1; i < events.length; i++) {
      const prevDate = new Date(events[i - 1].date);
      const currDate = new Date(events[i].date);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(7);
    }
  });
});
