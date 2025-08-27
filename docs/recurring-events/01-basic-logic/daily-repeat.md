# 매일 반복 기능 상세 설계

## 📋 개요

매일 반복되는 일정을 생성하는 핵심 로직을 구현합니다.

## 🎯 요구사항

- 시작일부터 종료일까지 매일 반복
- 반복 횟수 제한 (최대 10회)
- 반복 종료 조건: 특정 날짜까지 (2025-10-30)

## 🧪 테스트 케이스

### TC-001: 기본 매일 반복

**설명**: 2025-01-01부터 2025-01-05까지 매일 반복

**Given**:

```typescript
const config = {
  startDate: '2025-01-01',
  endDate: '2025-01-05',
  repeatType: 'daily',
  maxOccurrences: 10,
};
```

**When**:

```typescript
const events = generateRecurringEvents(config);
```

**Then**:

- 생성된 일정 수: 5개
- 첫 번째 일정: 2025-01-01
- 마지막 일정: 2025-01-05
- 모든 일정이 연속된 날짜에 생성됨

**테스트 코드**:

```typescript
describe('매일 반복', () => {
  it('2025-01-01부터 2025-01-05까지 매일 반복 일정을 생성한다', () => {
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
});
```

### TC-002: 반복 횟수 제한

**설명**: 최대 발생 횟수(10회)를 초과하지 않도록 제한

**Given**:

```typescript
const config = {
  startDate: '2025-01-01',
  endDate: '2025-12-31', // 1년
  repeatType: 'daily',
  maxOccurrences: 10,
};
```

**When**:

```typescript
const events = generateRecurringEvents(config);
```

**Then**:

- 생성된 일정 수: 10개 (maxOccurrences 제한)
- 마지막 일정: 2025-01-10

### TC-003: 반복 종료 조건

**설명**: 2025-10-30까지 반복을 제한

**Given**:

```typescript
const config = {
  startDate: '2025-01-01',
  endDate: '2025-10-30',
  repeatType: 'daily',
  maxOccurrences: 10,
};
```

**When**:

```typescript
const events = generateRecurringEvents(config);
```

**Then**:

- 생성된 일정 수: 10개 (maxOccurrences 제한)
- 마지막 일정: 2025-01-10 (2025-10-30 이전)

## 🏗️ 구현 세부사항

### 함수 시그니처

```typescript
function generateDailyRecurringEvents(
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
  }

  return [];
}

function generateDailyRecurringEvents(
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
      id: `daily-${occurrenceCount}-${currentDate.toISOString()}`,
      date: currentDate.toISOString().split('T')[0],
      isRecurring: true,
      recurringSeriesId: `daily-series-${startDate}`,
    });

    occurrenceCount++;

    // 다음 날짜 계산
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return events;
}
```

### 데이터 구조

```typescript
export interface RecurringEventConfig {
  startDate: string;
  endDate: string;
  repeatType: RepeatType;
  maxOccurrences: number;
}

export interface RecurringEvent {
  id: string;
  date: string;
  isRecurring: boolean;
  recurringSeriesId: string;
}
```

## ✅ 완료 기준

- [ ] TC-001 테스트 통과
- [ ] TC-002 테스트 통과
- [ ] TC-003 테스트 통과
- [ ] 매일 반복 로직 구현 완료
- [ ] 반복 횟수 제한 구현 완료
- [ ] 반복 종료 조건 구현 완료

## ⚠️ 주의사항

- 날짜 계산 시 시간대 고려 필요
- 윤년 처리 확인
- 성능: 대량의 일정 생성 시 최적화 고려
- 메모리: 무한 루프 방지를 위한 안전장치 필요

## 🔄 TDD 사이클

### 🔴 Red Phase

- TC-001, TC-002, TC-003 테스트 작성
- 테스트 실행하여 실패 확인

### 🟢 Green Phase

- 최소한의 구현으로 테스트 통과
- 기본적인 매일 반복 로직 구현

### 🔄 Refactor Phase

- 코드 품질 개선
- 성능 최적화
- 에러 처리 강화

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-27  
**작성자**: AI Assistant  
**검토자**: 개발팀
