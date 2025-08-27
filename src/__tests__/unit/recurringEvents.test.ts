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

describe('매월 반복', () => {
  it('TC-006: 2025-01-15부터 2025-05-15까지 매월 반복 일정을 생성한다', () => {
    // Given
    const config = {
      startDate: '2025-01-15',
      endDate: '2025-05-15',
      repeatType: 'monthly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(5);
    expect(events[0].date).toBe('2025-01-15');
    expect(events[4].date).toBe('2025-05-15');

    // 매월 같은 날짜 확인
    for (let i = 0; i < events.length; i++) {
      const eventDate = new Date(events[i].date);
      expect(eventDate.getDate()).toBe(15); // 매월 15일
    }
  });

  it('TC-007: 월간 계산 로직의 정확성과 경계값 처리를 검증한다', () => {
    // Given
    const config = {
      startDate: '2025-01-15',
      endDate: '2025-12-31',
      repeatType: 'monthly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(10); // maxOccurrences 제한
    expect(events[9].date).toBe('2025-10-15'); // 10개월 후

    // 모든 일정이 매월 같은 날짜에 생성됨
    for (let i = 0; i < events.length; i++) {
      const eventDate = new Date(events[i].date);
      expect(eventDate.getDate()).toBe(15); // 매월 15일
    }
  });

  it('TC-008: 월말과 연말 경계에서의 월간 반복 처리를 검증한다', () => {
    // Given - 30일로 시작하여 월말 앵커 유지 테스트
    const config = {
      startDate: '2025-01-30',
      endDate: '2025-06-30',
      repeatType: 'monthly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(6);
    expect(events[0].date).toBe('2025-01-30');
    expect(events[5].date).toBe('2025-06-30');

    // 디버깅: 생성된 모든 날짜 출력
    console.log('생성된 날짜들:');
    events.forEach((event, index) => {
      console.log(`${index + 1}월: ${event.date}`);
    });

    // 2월, 4월은 해당 월의 마지막 날에 생성됨 (월말 앵커 유지)
    const febEvent = events.find((e) => e.date.startsWith('2025-02'));
    const aprEvent = events.find((e) => e.date.startsWith('2025-04'));

    expect(febEvent?.date).toBe('2025-02-28'); // 2월은 28일
    expect(aprEvent?.date).toBe('2025-04-30'); // 4월은 30일
  });
});

describe('매년 반복', () => {
  it('TC-008: 2025-01-15부터 2029-01-15까지 매년 반복 일정을 생성한다', () => {
    // Given
    const config = {
      startDate: '2025-01-15',
      endDate: '2029-01-15',
      repeatType: 'yearly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(5);
    expect(events[0].date).toBe('2025-01-15');
    expect(events[4].date).toBe('2029-01-15');

    // 매년 같은 날짜 확인
    for (let i = 0; i < events.length; i++) {
      const eventDate = new Date(events[i].date);
      expect(eventDate.getDate()).toBe(15); // 매년 1월 15일
      expect(eventDate.getMonth()).toBe(0); // 매년 1월
    }
  });

  it('TC-009: 연간 계산 로직의 정확성과 경계값 처리를 검증한다', () => {
    // Given
    const config = {
      startDate: '2025-01-15',
      endDate: '2035-12-31',
      repeatType: 'yearly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(10); // maxOccurrences 제한
    expect(events[9].date).toBe('2034-01-15'); // 10년 후

    // 모든 일정이 매년 같은 날짜에 생성됨
    for (let i = 0; i < events.length; i++) {
      const eventDate = new Date(events[i].date);
      expect(eventDate.getDate()).toBe(15); // 매년 1월 15일
      expect(eventDate.getMonth()).toBe(0); // 매년 1월
    }
  });

  it('TC-010: 윤년 29일 처리의 정확성을 검증한다', () => {
    // Given
    const config = {
      startDate: '2024-02-29', // 윤년
      endDate: '2032-02-29',
      repeatType: 'yearly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(9); // 2024-2032년까지 9개
    expect(events[0].date).toBe('2024-02-29'); // 2024년 (윤년)
    expect(events[4].date).toBe('2028-02-29'); // 2028년 (윤년)
    expect(events[8].date).toBe('2032-02-29'); // 2032년 (윤년)

    // 디버깅: 생성된 모든 날짜 출력
    console.log('생성된 날짜들:');
    events.forEach((event, index) => {
      console.log(`${index + 1}: ${event.date}`);
    });

    // 윤년이 아닌 해에는 2월 28일에 생성됨
    const nonLeapYearEvents = events.filter((e) => {
      const year = new Date(e.date).getFullYear();
      return (
        year === 2025 ||
        year === 2026 ||
        year === 2027 ||
        year === 2029 ||
        year === 2030 ||
        year === 2031
      );
    });

    // 윤년이 아닌 해의 이벤트는 2월 28일에 생성되어야 함
    nonLeapYearEvents.forEach((event) => {
      const eventDate = new Date(event.date);
      expect(eventDate.getDate()).toBe(28);
      expect(eventDate.getMonth()).toBe(1); // 2월
    });
  });
});

describe('31일 처리 엣지 케이스', () => {
  it('TC-101: 31일이 있는 달에만 생성한다', () => {
    // Given
    const config = {
      startDate: '2025-01-31',
      endDate: '2025-12-31',
      repeatType: 'monthly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(7);

    const expectedMonths = [1, 3, 5, 7, 8, 10, 12];
    events.forEach((event, index) => {
      const eventDate = new Date(event.date);
      expect(eventDate.getDate()).toBe(31);
      expect(eventDate.getMonth() + 1).toBe(expectedMonths[index]);
    });
  });
});
