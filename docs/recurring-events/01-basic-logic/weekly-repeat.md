# 매주 반복 기능 상세 설계

## 📋 개요

매주 반복되는 일정을 생성하는 핵심 로직을 구현합니다.

## 🎯 요구사항

- 시작일부터 종료일까지 매주 반복
- 반복 횟수 제한 (최대 10회)
- 반복 종료 조건: 특정 날짜까지 (2025-10-30)
- 주간 계산의 정확성 보장

## 🧪 테스트 케이스

### TC-004: 기본 매주 반복

**설명**: 2025-01-01부터 2025-01-29까지 매주 반복

**Given**:

```typescript
const config = {
  startDate: '2025-01-01',
  endDate: '2025-01-29',
  repeatType: 'weekly',
  maxOccurrences: 10,
};
```

**When**:

```typescript
const events = generateRecurringEvents(config);
```

**Then**:

- 생성된 일정 수: 5개 (1월 1일, 8일, 15일, 22일, 29일)
- 첫 번째 일정: 2025-01-01
- 마지막 일정: 2025-01-29
- 모든 일정이 7일 간격으로 생성됨

**테스트 코드**:

```typescript
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
});
```

### TC-005: 주간 계산 로직 테스트

**설명**: 주간 계산의 정확성과 경계값 처리

**Given**:

```typescript
const config = {
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  repeatType: 'weekly',
  maxOccurrences: 10,
};
```

**When**:

```typescript
const events = generateRecurringEvents(config);
```

**Then**:

- 생성된 일정 수: 10개 (maxOccurrences 제한)
- 마지막 일정: 2025-03-05 (10주 후)
- 모든 일정이 정확히 7일 간격으로 생성됨

### TC-006: 주간 반복 경계값 테스트

**설명**: 월말과 연말 경계에서의 주간 반복 처리

**Given**:

```typescript
const config = {
  startDate: '2025-01-28',
  endDate: '2025-02-25',
  repeatType: 'weekly',
  maxOccurrences: 10,
};
```

**When**:

```typescript
const events = generateRecurringEvents(config);
```

**Then**:

- 생성된 일정 수: 5개
- 첫 번째: 2025-01-28
- 마지막: 2025-02-25
- 월 경계를 넘어서도 정확한 7일 간격 유지

## 🏗️ 구현 세부사항

### 함수 시그니처

```typescript
function generateWeeklyRecurringEvents(
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
  }

  return [];
}

function generateWeeklyRecurringEvents(
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
      id: `weekly-${occurrenceCount}-${currentDate.toISOString()}`,
      date: currentDate.toISOString().split('T')[0],
      isRecurring: true,
      recurringSeriesId: `weekly-series-${startDate}`,
    });

    occurrenceCount++;

    // 다음 주 계산 (7일 후)
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return events;
}
```

### 데이터 구조 확장

```typescript
export interface RecurringEventConfig {
  startDate: string;
  endDate: string;
  repeatType: RepeatType;
  maxOccurrences: number;
  // 향후 확장: 요일 지정 기능
  // selectedDays?: number[]; // 0=일요일, 1=월요일, ..., 6=토요일
}
```

## ✅ 완료 기준

- [ ] TC-004 테스트 통과
- [ ] TC-005 테스트 통과
- [ ] TC-006 테스트 통과
- [ ] 매주 반복 로직 구현 완료
- [ ] 주간 계산 정확성 검증
- [ ] 경계값 처리 완료

## ⚠️ 주의사항

- 주간 계산 시 7일 간격의 정확성 보장
- 월말/연말 경계에서의 날짜 계산 정확성
- 성능: 대량의 주간 일정 생성 시 최적화 고려
- 향후 요일 지정 기능 확장 고려

## 🔄 TDD 사이클

### 🔴 Red Phase

- TC-004, TC-005, TC-006 테스트 작성
- 테스트 실행하여 실패 확인

### 🟢 Green Phase

- 최소한의 구현으로 테스트 통과
- 기본적인 매주 반복 로직 구현

### 🔄 Refactor Phase

- 코드 품질 개선
- 성능 최적화
- 에러 처리 강화

## 📊 테스트 데이터

### 주간 반복 테스트 시나리오

```typescript
export const WEEKLY_TEST_SCENARIOS = {
  BASIC_WEEKLY: {
    startDate: '2025-01-01',
    endDate: '2025-01-29',
    expectedCount: 5,
    expectedDates: ['2025-01-01', '2025-01-08', '2025-01-15', '2025-01-22', '2025-01-29'],
  },
  YEAR_SPAN: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    expectedCount: 10, // maxOccurrences 제한
    expectedLastDate: '2025-03-05',
  },
  MONTH_BOUNDARY: {
    startDate: '2025-01-28',
    endDate: '2025-02-25',
    expectedCount: 5,
    expectedDates: ['2025-01-28', '2025-02-04', '2025-02-11', '2025-02-18', '2025-02-25'],
  },
};
```

## 🚀 향후 확장 계획

### 요일 지정 기능 (선택 과제)

- 특정 요일만 선택하여 반복
- 다중 요일 선택 지원
- 요일별 우선순위 설정

### 주간 간격 설정

- 2주마다, 3주마다 등 간격 조정
- 비정기적인 주간 패턴 지원

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-28  
**작성자**: AI Assistant  
**검토자**: 개발팀
