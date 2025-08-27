# 매월 반복 기능 상세 설계

## 📋 개요

매월 반복되는 일정을 생성하는 핵심 로직을 구현합니다. 31일 처리와 같은 엣지 케이스를 고려하여 설계합니다.

## 🎯 요구사항

- 시작일부터 종료일까지 매월 반복
- 반복 횟수 제한 (최대 10회)
- 반복 종료 조건: 특정 날짜까지 (2025-10-30)
- 월간 계산의 정확성 보장
- 31일 처리 엣지 케이스 고려

## 🧪 테스트 케이스

### TC-006: 기본 매월 반복

**설명**: 2025-01-15부터 2025-05-15까지 매월 반복

**Given**:

```typescript
const config = {
  startDate: '2025-01-15',
  endDate: '2025-05-15',
  repeatType: 'monthly',
  maxOccurrences: 10,
};
```

**When**:

```typescript
const events = generateRecurringEvents(config);
```

**Then**:

- 생성된 일정 수: 5개 (1월 15일, 2월 15일, 3월 15일, 4월 15일, 5월 15일)
- 첫 번째 일정: 2025-01-15
- 마지막 일정: 2025-05-15
- 모든 일정이 매월 같은 날짜에 생성됨

**테스트 코드**:

```typescript
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
});
```

### TC-007: 월간 계산 로직 테스트

**설명**: 월간 계산의 정확성과 경계값 처리

**Given**:

```typescript
const config = {
  startDate: '2025-01-15',
  endDate: '2025-12-31',
  repeatType: 'monthly',
  maxOccurrences: 10,
};
```

**When**:

```typescript
const events = generateRecurringEvents(config);
```

**Then**:

- 생성된 일정 수: 10개 (maxOccurrences 제한)
- 마지막 일정: 2025-10-15 (10개월 후)
- 모든 일정이 매월 같은 날짜에 생성됨

### TC-008: 월간 반복 경계값 테스트

**설명**: 월말과 연말 경계에서의 월간 반복 처리

**Given**:

```typescript
const config = {
  startDate: '2025-01-31',
  endDate: '2025-06-30',
  repeatType: 'monthly',
  maxOccurrences: 10,
};
```

**When**:

```typescript
const events = generateRecurringEvents(config);
```

**Then**:

- 생성된 일정 수: 6개
- 첫 번째: 2025-01-31
- 마지막: 2025-06-30
- 2월, 4월, 6월은 해당 월의 마지막 날에 생성됨

## 🏗️ 구현 세부사항

### 함수 시그니처

```typescript
function generateMonthlyRecurringEvents(
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
  }

  return [];
}

function generateMonthlyRecurringEvents(
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
      id: `monthly-${occurrenceCount}-${currentDate.toISOString()}`,
      date: currentDate.toISOString().split('T')[0],
      isRecurring: true,
      recurringSeriesId: `monthly-series-${startDate}`,
    });

    occurrenceCount++;

    // 다음 달 계산
    currentDate = addMonths(currentDate, 1);
  }

  return events;
}

// 월 추가 헬퍼 함수
function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  const currentMonth = newDate.getMonth();
  const targetMonth = currentMonth + months;

  newDate.setMonth(targetMonth);

  // 31일 처리: 원래 날짜가 31일이고 대상 월이 30일 이하인 경우
  if (date.getDate() === 31 && newDate.getDate() !== 31) {
    newDate.setDate(0); // 해당 월의 마지막 날로 설정
  }

  return newDate;
}
```

### 데이터 구조 확장

```typescript
export interface RecurringEventConfig {
  startDate: string;
  endDate: string;
  repeatType: RepeatType;
  maxOccurrences: number;
  // 향후 확장: 월간 반복 옵션
  // monthlyOption?: 'same-date' | 'same-weekday' | 'same-week-of-month';
}
```

## ✅ 완료 기준

- [ ] TC-006 테스트 통과
- [ ] TC-007 테스트 통과
- [ ] TC-008 테스트 통과
- [ ] 매월 반복 로직 구현 완료
- [ ] 월간 계산 정확성 검증
- [ ] 31일 처리 엣지 케이스 완료

## ⚠️ 주의사항

- 월간 계산 시 31일 처리의 정확성 보장
- 월말/연말 경계에서의 날짜 계산 정확성
- 성능: 대량의 월간 일정 생성 시 최적화 고려
- 향후 월간 반복 옵션 확장 고려

## 🔄 TDD 사이클

### 🔴 Red Phase

- TC-006, TC-007, TC-008 테스트 작성
- 테스트 실행하여 실패 확인

### 🟢 Green Phase

- 최소한의 구현으로 테스트 통과
- 기본적인 매월 반복 로직 구현

### 🔄 Refactor Phase

- 코드 품질 개선
- 성능 최적화
- 에러 처리 강화

## 📊 테스트 데이터

### 월간 반복 테스트 시나리오

```typescript
export const MONTHLY_TEST_SCENARIOS = {
  BASIC_MONTHLY: {
    startDate: '2025-01-15',
    endDate: '2025-05-15',
    expectedCount: 5,
    expectedDates: ['2025-01-15', '2025-02-15', '2025-03-15', '2025-04-15', '2025-05-15'],
  },
  YEAR_SPAN: {
    startDate: '2025-01-15',
    endDate: '2025-12-31',
    expectedCount: 10, // maxOccurrences 제한
    expectedLastDate: '2025-10-15',
  },
  MONTH_BOUNDARY: {
    startDate: '2025-01-31',
    endDate: '2025-06-30',
    expectedCount: 6,
    expectedDates: [
      '2025-01-31',
      '2025-02-28',
      '2025-03-31',
      '2025-04-30',
      '2025-05-31',
      '2025-06-30',
    ],
  },
};
```

## 🚀 향후 확장 계획

### 월간 반복 옵션 (선택 과제)

- 매월 같은 날짜에 반복
- 매월 같은 요일의 N번째 주에 반복
- 매월 마지막 요일에 반복

### 월간 간격 설정

- 2개월마다, 3개월마다 등 간격 조정
- 비정기적인 월간 패턴 지원

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-29  
**작성자**: AI Assistant  
**검토자**: 개발팀
