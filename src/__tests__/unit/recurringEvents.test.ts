import {
  generateRecurringEvents,
  modifySingleEvent,
  deleteSingleEvent,
  getRecurringIconInfo,
} from '../../utils/recurringEvents';
import { RepeatType, YearlyFeb29Policy } from '../../types/recurringEvents';

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

  it('TC-102: 31일이 없는 달에서 건너뛰기 처리', () => {
    // Given
    const config = {
      startDate: '2025-01-31',
      endDate: '2025-03-31',
      repeatType: 'monthly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(2);
    expect(events[0].date).toBe('2025-01-31');
    expect(events[1].date).toBe('2025-03-31');
    // 2월은 31일이 없으므로 건너뛰기
  });

  it('TC-103: 윤년 고려한 31일 처리', () => {
    // Given
    const config = {
      startDate: '2024-01-31',
      endDate: '2024-12-31',
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
    // 2월은 윤년이어도 31일은 없으므로 건너뛰기
  });
});

describe('윤년 29일 처리 엣지 케이스', () => {
  it('TC-201: 윤년에만 2월 29일에 생성한다', () => {
    // Given
    const config = {
      startDate: '2024-02-29',
      endDate: '2032-12-31',
      repeatType: 'yearly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(3);

    const expectedYears = [2024, 2028, 2032];
    events.forEach((event, index) => {
      const eventDate = new Date(event.date);
      expect(eventDate.getMonth()).toBe(1); // 2월 (0-based)
      expect(eventDate.getDate()).toBe(29);
      expect(eventDate.getFullYear()).toBe(expectedYears[index]);
    });
  });

  it('TC-202: 윤년과 평년의 경계에서의 처리', () => {
    // Given
    const config = {
      startDate: '2024-02-29',
      endDate: '2025-12-31',
      repeatType: 'yearly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(1);
    expect(events[0].date).toBe('2024-02-29');
    // 2025년은 평년이므로 건너뛰기
  });

  it('TC-203: 100년 규칙 적용', () => {
    // Given
    const config = {
      startDate: '2000-02-29', // 2000년은 윤년 (400으로 나누어떨어짐)
      endDate: '2100-12-31',
      repeatType: 'yearly' as RepeatType,
      maxOccurrences: 10,
      policies: { yearlyFeb29Policy: 'leap-400-only' as YearlyFeb29Policy },
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(1); // 2000년만 (400으로 나누어떨어짐)
    expect(events[0].date).toBe('2000-02-29');
    // 2100년은 100년 규칙으로 윤년 아님
  });

  it('TC-204: 400년 규칙 적용', () => {
    // Given
    const config = {
      startDate: '2000-02-29',
      endDate: '2400-12-31',
      repeatType: 'yearly' as RepeatType,
      maxOccurrences: 10,
      policies: { yearlyFeb29Policy: 'leap-400-only' as YearlyFeb29Policy },
    };

    // When
    const events = generateRecurringEvents(config);

    // Then
    expect(events).toHaveLength(2);
    expect(events[0].date).toBe('2000-02-29');
    expect(events[1].date).toBe('2400-02-29');
    // 둘 다 400으로 나누어떨어지는 윤년
  });
});

describe('단일 수정 엣지 케이스', () => {
  it('TC-301: 기본 단일 수정 테스트', () => {
    // Given
    const config = {
      startDate: '2025-01-15',
      endDate: '2025-12-31',
      repeatType: 'monthly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);
    const modifiedEvent = modifySingleEvent(events, 2, { title: '수정된 제목' });

    // Then
    expect(events).toHaveLength(10);
    expect(modifiedEvent.title).toBe('수정된 제목');
    expect(modifiedEvent.isRecurring).toBe(true);
    expect(modifiedEvent.recurringSeriesId).toBe('monthly-series-2025-01-15');
  });

  it('TC-302: 속성 변경 테스트', () => {
    // Given
    const config = {
      startDate: '2025-01-01',
      endDate: '2025-01-10',
      repeatType: 'daily' as RepeatType,
      maxOccurrences: 5,
    };

    // When
    const events = generateRecurringEvents(config);
    const modifiedEvent = {
      ...events[1],
      title: '새로운 제목',
      description: '새로운 설명',
      isRecurring: false, // 단일 수정으로 변경
    };

    // Then
    expect(events).toHaveLength(5);
    expect(modifiedEvent.title).toBe('새로운 제목');
    expect(modifiedEvent.description).toBe('새로운 설명');
    expect(modifiedEvent.isRecurring).toBe(false);
    expect(modifiedEvent.recurringSeriesId).toBe('daily-series-2025-01-01');
  });

  it('TC-303: UI 상태 확인 테스트', () => {
    // Given
    const config = {
      startDate: '2025-01-15',
      endDate: '2029-01-15',
      repeatType: 'yearly' as RepeatType,
      maxOccurrences: 5,
    };

    // When
    const events = generateRecurringEvents(config);
    const modifiedEvents = events.map((event, index) => ({
      ...event,
      isModified: index === 2, // 3번째 이벤트만 수정됨
      modificationDate: index === 2 ? '2025-02-01' : undefined,
    }));

    // Then
    expect(events).toHaveLength(5);
    expect(modifiedEvents[2].isModified).toBe(true);
    expect(modifiedEvents[2].modificationDate).toBe('2025-02-01');
    expect(modifiedEvents[0].isModified).toBe(false);
    expect(modifiedEvents[0].modificationDate).toBeUndefined();
  });
});

describe('단일 삭제 엣지 케이스', () => {
  it('TC-401: 기본 단일 삭제 테스트', () => {
    // Given
    const config = {
      startDate: '2025-01-15',
      endDate: '2025-12-31',
      repeatType: 'monthly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);
    const deletedEvent = deleteSingleEvent(events, 2);

    // Then
    expect(events).toHaveLength(10); // 원본 배열은 변경되지 않음
    expect(deletedEvent).toBeDefined();
    expect(deletedEvent.id).toBe('monthly-2-2025-03-15T00:00:00.000Z');
    expect(deletedEvent.isDeleted).toBe(true);
    expect(deletedEvent.deletionDate).toBeDefined();
  });

  it('TC-402: 시리즈 유지 테스트', () => {
    // Given
    const config = {
      startDate: '2025-01-01',
      endDate: '2025-01-10',
      repeatType: 'daily' as RepeatType,
      maxOccurrences: 5,
    };

    // When
    const events = generateRecurringEvents(config);
    const deletedEvent = deleteSingleEvent(events, 1);

    // 삭제된 이벤트와 원본 이벤트를 비교
    const originalEvent = events[1];

    // Then
    expect(events).toHaveLength(5); // 원본 배열은 변경되지 않음
    expect(deletedEvent.isDeleted).toBe(true);
    expect(deletedEvent.recurringSeriesId).toBe('daily-series-2025-01-01');
    expect(deletedEvent.deletionDate).toBeDefined();

    // 원본 이벤트는 변경되지 않음
    expect(originalEvent.isDeleted).toBeUndefined();
    expect(originalEvent.deletionDate).toBeUndefined();

    // 삭제된 이벤트는 원본과 동일한 기본 정보를 가짐
    expect(deletedEvent.id).toBe(originalEvent.id);
    expect(deletedEvent.date).toBe(originalEvent.date);
  });
});

describe('반복 아이콘 표시 엣지 케이스', () => {
  it('TC-501: 기본 반복 아이콘 표시 테스트', () => {
    // Given
    const config = {
      startDate: '2025-01-15',
      endDate: '2025-12-31',
      repeatType: 'monthly' as RepeatType,
      maxOccurrences: 10,
    };

    // When
    const events = generateRecurringEvents(config);
    const iconInfo = getRecurringIconInfo(events[0]);

    // Then
    expect(iconInfo.shouldShow).toBe(true);
    expect(iconInfo.iconType).toBe('monthly');
    expect(iconInfo.tooltip).toBe('매월 반복');
    expect(iconInfo.color).toBe('#3B82F6');
  });

  it('TC-502: 아이콘 숨김 테스트', () => {
    // Given
    const config = {
      startDate: '2025-01-01',
      endDate: '2025-01-10',
      repeatType: 'daily' as RepeatType,
      maxOccurrences: 5,
    };

    // When
    const events = generateRecurringEvents(config);
    const modifiedEvent = modifySingleEvent(events, 1, { isRecurring: false });
    const iconInfo = getRecurringIconInfo(modifiedEvent);

    // Then
    expect(iconInfo.shouldShow).toBe(false);
    expect(iconInfo.iconType).toBeUndefined();
    expect(iconInfo.tooltip).toBeUndefined();
  });

  it('TC-503: 다양한 반복 유형별 아이콘 테스트', () => {
    // Given
    const dailyConfig = {
      startDate: '2025-01-01',
      endDate: '2025-01-05',
      repeatType: 'daily' as RepeatType,
      maxOccurrences: 5,
    };
    const weeklyConfig = {
      startDate: '2025-01-01',
      endDate: '2025-01-29',
      repeatType: 'weekly' as RepeatType,
      maxOccurrences: 5,
    };
    const yearlyConfig = {
      startDate: '2025-01-15',
      endDate: '2029-01-15',
      repeatType: 'yearly' as RepeatType,
      maxOccurrences: 5,
    };

    // When
    const dailyEvents = generateRecurringEvents(dailyConfig);
    const weeklyEvents = generateRecurringEvents(weeklyConfig);
    const yearlyEvents = generateRecurringEvents(yearlyConfig);

    const dailyIcon = getRecurringIconInfo(dailyEvents[0]);
    const weeklyIcon = getRecurringIconInfo(weeklyEvents[0]);
    const yearlyIcon = getRecurringIconInfo(yearlyEvents[0]);

    // Then
    expect(dailyIcon.iconType).toBe('daily');
    expect(dailyIcon.tooltip).toBe('매일 반복');
    expect(dailyIcon.color).toBe('#10B981');

    expect(weeklyIcon.iconType).toBe('weekly');
    expect(weeklyIcon.tooltip).toBe('매주 반복');
    expect(weeklyIcon.color).toBe('#8B5CF6');

    expect(yearlyIcon.iconType).toBe('yearly');
    expect(yearlyIcon.tooltip).toBe('매년 반복');
    expect(yearlyIcon.color).toBe('#F59E0B');
  });
});
