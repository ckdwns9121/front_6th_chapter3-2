# 매년 반복 기능 상세 설계

## 📋 개요

매년 반복되는 일정을 생성하는 핵심 로직을 구현합니다. 윤년 29일 처리와 같은 엣지 케이스를 고려하여 설계합니다.

## 🎯 요구사항

- 시작일부터 종료일까지 매년 반복
- 반복 횟수 제한 (최대 10회)
- 반복 종료 조건: 특정 날짜까지 (2025-10-30)
- 연간 계산의 정확성 보장
- 윤년 29일 처리 엣지 케이스 고려

## 🧪 테스트 케이스

### TC-008: 기본 매년 반복

**설명**: 2025-01-15부터 2029-01-15까지 매년 반복

**Given**:

```typescript
const config = {
  startDate: '2025-01-15',
  endDate: '2029-01-15',
  repeatType: 'yearly',
  maxOccurrences: 10,
};
```

**When**:

```typescript
const events = generateRecurringEvents(config);
```

**Then**:

- 생성된 일정 수: 5개 (2025, 2026, 2027, 2028, 2029년 1월 15일)
- 첫 번째 일정: 2025-01-15
- 마지막 일정: 2029-01-15
- 모든 일정이 매년 같은 날짜에 생성됨

**테스트 코드**:

```typescript
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
});
```

### TC-009: 연간 계산 로직 테스트

**설명**: 연간 계산의 정확성과 경계값 처리

**Given**:

```typescript
const config = {
  startDate: '2025-01-15',
  endDate: '2035-12-31',
  repeatType: 'yearly',
  maxOccurrences: 10,
};
```

**When**:

```typescript
const events = generateRecurringEvents(config);
```

**Then**:

- 생성된 일정 수: 10개 (maxOccurrences 제한)
- 마지막 일정: 2034-01-15 (10년 후)
- 모든 일정이 매년 같은 날짜에 생성됨

### TC-010: 윤년 29일 처리 테스트

**설명**: 윤년 2월 29일 처리의 정확성

**Given**:

```typescript
const config = {
  startDate: '2024-02-29', // 윤년
  endDate: '2032-02-29',
  repeatType: 'yearly',
  maxOccurrences: 10,
};
```

**When**:

```typescript
const events = generateRecurringEvents(config);
```

**Then**:

- 생성된 일정 수: 3개 (2024, 2028, 2032년 2월 29일)
- 윤년이 아닌 해에는 2월 28일에 생성됨
- 윤년 규칙이 올바르게 적용됨

## 🏗️ 구현 세부사항

### 함수 시그니처

```typescript
function generateYearlyRecurringEvents(
  startDate: string,
  endDate: string,
  maxOccurrences: number
): RecurringEvent[];
```

### 핵심 로직

```typescript
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

function generateYearlyRecurringEvents(
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
      id: `yearly-${occurrenceCount}-${currentDate.toISOString()}`,
      date: currentDate.toISOString().split('T')[0],
      isRecurring: true,
      recurringSeriesId: `yearly-series-${startDate}`,
    });

    occurrenceCount++;

    // 다음 해 계산
    currentDate = addYears(currentDate, 1);
  }

  return events;
}

// 연도 추가 헬퍼 함수
function addYears(date: Date, years: number): Date {
  const newDate = new Date(date);
  const currentYear = newDate.getFullYear();
  const targetYear = currentYear + years;

  newDate.setFullYear(targetYear);

  // 윤년 29일 처리: 원래 날짜가 2월 29일이고 대상 해가 윤년이 아닌 경우
  if (date.getMonth() === 1 && date.getDate() === 29 && !isLeapYear(targetYear)) {
    newDate.setDate(28); // 2월 28일로 설정
  }

  return newDate;
}

// 윤년 판별 함수
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
```

### 데이터 구조 확장

```typescript
export interface RecurringEventConfig {
  startDate: string;
  endDate: string;
  repeatType: RepeatType;
  maxOccurrences: number;
  // 향후 확장: 연간 반복 옵션
  // yearlyOption?: 'same-date' | 'same-weekday' | 'same-week-of-year';
}
```

## ✅ 완료 기준

- [ ] TC-008 테스트 통과
- [ ] TC-009 테스트 통과
- [ ] TC-010 테스트 통과
- [ ] 매년 반복 로직 구현 완료
- [ ] 연간 계산 정확성 검증
- [ ] 윤년 29일 처리 엣지 케이스 완료

## ⚠️ 주의사항

- 연간 계산 시 윤년 29일 처리의 정확성 보장
- 윤년 규칙 (4년마다, 100년마다 제외, 400년마다 포함) 정확성
- 성능: 대량의 연간 일정 생성 시 최적화 고려
- 향후 연간 반복 옵션 확장 고려

## 🔄 TDD 사이클

### 🔴 Red Phase

- TC-008, TC-009, TC-010 테스트 작성
- 테스트 실행하여 실패 확인

### 🟢 Green Phase

- 최소한의 구현으로 테스트 통과
- 기본적인 매년 반복 로직 구현

### 🔄 Refactor Phase

- 코드 품질 개선
- 성능 최적화
- 에러 처리 강화

## 📊 테스트 데이터

### 연간 반복 테스트 시나리오

```typescript
export const YEARLY_TEST_SCENARIOS = {
  BASIC_YEARLY: {
    startDate: '2025-01-15',
    endDate: '2029-01-15',
    expectedCount: 5,
    expectedDates: ['2025-01-15', '2026-01-15', '2027-01-15', '2028-01-15', '2029-01-15'],
  },
  DECADE_SPAN: {
    startDate: '2025-01-15',
    endDate: '2035-12-31',
    expectedCount: 10, // maxOccurrences 제한
    expectedLastDate: '2034-01-15',
  },
  LEAP_YEAR_29TH: {
    startDate: '2024-02-29',
    endDate: '2032-02-29',
    expectedCount: 3,
    expectedDates: ['2024-02-29', '2028-02-29', '2032-02-29'],
  },
};
```

## 🚀 향후 확장 계획

### 연간 반복 옵션 (선택 과제)

- 매년 같은 날짜에 반복
- 매년 같은 요일의 N번째 주에 반복
- 매년 같은 주차에 반복

### 연간 간격 설정

- 2년마다, 3년마다 등 간격 조정
- 비정기적인 연간 패턴 지원

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-29  
**작성자**: AI Assistant  
**검토자**: 개발팀
