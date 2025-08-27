# 반복 일정 단일 수정 기능 상세 설계

## 📋 개요

반복 일정을 수정할 때 해당 일정만 단일 일정으로 변경하는 기능을 구현합니다.

## 🎯 요구사항

- 반복 일정을 수정하면 단일 일정으로 변경
- 반복 일정 아이콘이 사라짐
- 원본 반복 일정 시리즈는 유지
- 수정된 일정은 더 이상 반복되지 않음

## 🧪 테스트 케이스

### TC-301: 반복 일정 단일 수정 - 기본 케이스

**설명**: 반복 일정을 수정하여 단일 일정으로 변경

**Given**:

```typescript
const recurringEvent = createRecurringEvent({
  id: 'event-001',
  title: '매일 회의',
  date: '2025-01-15',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: '2025-01-20',
  },
  isRecurring: true,
  recurringSeriesId: 'daily-series-2025-01-15',
});
```

**When**:

```typescript
const modifiedEvent = convertToSingleEvent(recurringEvent);
```

**Then**:

- `isRecurring`이 `false`로 변경
- `repeat.type`이 `'none'`으로 변경
- `isModified`가 `true`로 설정
- `recurringSeriesId`는 유지 (참조용)

**테스트 코드**:

```typescript
describe('반복 일정 단일 수정', () => {
  it('반복 일정을 수정하면 단일 일정으로 변경된다', () => {
    // Given
    const recurringEvent = createRecurringEvent({
      id: 'event-001',
      title: '매일 회의',
      date: '2025-01-15',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-20',
      },
      isRecurring: true,
      recurringSeriesId: 'daily-series-2025-01-15',
    });

    // When
    const modifiedEvent = convertToSingleEvent(recurringEvent);

    // Then
    expect(modifiedEvent.isRecurring).toBe(false);
    expect(modifiedEvent.repeat.type).toBe('none');
    expect(modifiedEvent.isModified).toBe(true);
    expect(modifiedEvent.recurringSeriesId).toBe('daily-series-2025-01-15');
    expect(modifiedEvent.title).toBe('매일 회의'); // 다른 속성은 유지
  });
});
```

### TC-302: 반복 일정 단일 수정 - 속성 변경

**설명**: 수정된 일정의 제목과 시간을 변경

**Given**:

```typescript
const modifiedEvent = convertToSingleEvent(recurringEvent);
```

**When**:

```typescript
modifiedEvent.title = '수정된 회의';
modifiedEvent.startTime = '14:00';
modifiedEvent.endTime = '15:00';
```

**Then**:

- 제목이 '수정된 회의'로 변경
- 시작 시간이 '14:00'으로 변경
- 종료 시간이 '15:00'으로 변경
- 반복 관련 속성은 변경되지 않음

### TC-303: 반복 일정 단일 수정 - UI 상태 확인

**설명**: 수정된 일정이 UI에서 올바르게 표시되는지 확인

**Given**:

```typescript
const modifiedEvent = convertToSingleEvent(recurringEvent);
```

**When**:

```typescript
// UI에서 반복 아이콘 표시 여부 확인
const hasRecurringIcon = shouldShowRecurringIcon(modifiedEvent);
```

**Then**:

- `hasRecurringIcon`이 `false` 반환
- 반복 아이콘이 표시되지 않음

## 🏗️ 구현 세부사항

### 함수 시그니처

```typescript
/**
 * 반복 일정을 단일 일정으로 변경
 * @param event 원본 반복 일정
 * @returns 수정된 단일 일정
 */
export function convertToSingleEvent(event: Event): Event {
  return {
    ...event,
    isRecurring: false,
    isModified: true,
    repeat: {
      type: 'none',
      interval: 0,
      endDate: undefined,
    },
  };
}
```

### 데이터 구조 확장

```typescript
export interface Event extends EventForm {
  id: string;
  isRecurring?: boolean;
  isModified?: boolean;
  recurringSeriesId?: string;
}

export interface EventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number;
}
```

### UI 상태 관리

```typescript
/**
 * 반복 아이콘 표시 여부 결정
 * @param event 이벤트
 * @returns 반복 아이콘 표시 여부
 */
export function shouldShowRecurringIcon(event: Event): boolean {
  return event.isRecurring === true && event.isModified !== true;
}

/**
 * 반복 일정인지 확인
 * @param event 이벤트
 * @returns 반복 일정 여부
 */
export function isRecurringEvent(event: Event): boolean {
  return event.isRecurring === true && event.isModified !== true;
}
```

## ✅ 완료 기준

- [ ] TC-301 테스트 통과
- [ ] TC-302 테스트 통과
- [ ] TC-303 테스트 통과
- [ ] `convertToSingleEvent` 함수 구현 완료
- [ ] 데이터 구조 확장 완료
- [ ] UI 상태 관리 로직 구현 완료

## ⚠️ 주의사항

- 원본 반복 일정 시리즈의 무결성 유지
- 수정된 일정의 참조 관계 관리
- UI 상태 동기화
- 데이터 일관성 보장

## 🔄 TDD 사이클

### 🔴 Red Phase

- TC-301, TC-302, TC-303 테스트 작성
- 테스트 실행하여 실패 확인

### 🟢 Green Phase

- 최소한의 구현으로 테스트 통과
- `convertToSingleEvent` 함수 구현
- 데이터 구조 확장

### 🔄 Refactor Phase

- UI 상태 관리 로직 개선
- 코드 가독성 향상
- 에러 처리 강화

## 📊 테스트 데이터 팩토리

### 반복 일정 생성 헬퍼

```typescript
export const createRecurringEvent = (overrides = {}) => ({
  id: 'test-event-1',
  title: '테스트 반복 일정',
  date: '2025-01-01',
  startTime: '09:00',
  endTime: '10:00',
  description: '테스트 설명',
  location: '테스트 장소',
  category: '업무',
  repeat: {
    type: 'daily' as RepeatType,
    interval: 1,
    endDate: '2025-01-10',
  },
  notificationTime: 10,
  isRecurring: true,
  recurringSeriesId: 'test-series-001',
  ...overrides,
});
```

### 단일 수정 테스트 시나리오

```typescript
describe('단일 수정 시나리오', () => {
  it('매일 반복 일정을 단일 일정으로 수정한다', () => {
    // Given: 매일 반복 일정
    const dailyEvent = createRecurringEvent({
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
    });

    // When: 단일 일정으로 변환
    const singleEvent = convertToSingleEvent(dailyEvent);

    // Then: 단일 일정 속성 확인
    expect(singleEvent.isRecurring).toBe(false);
    expect(singleEvent.isModified).toBe(true);
    expect(singleEvent.repeat.type).toBe('none');
  });

  it('주간 반복 일정을 단일 일정으로 수정한다', () => {
    // Given: 주간 반복 일정
    const weeklyEvent = createRecurringEvent({
      repeat: { type: 'weekly', interval: 1, endDate: '2025-03-31' },
    });

    // When: 단일 일정으로 변환
    const singleEvent = convertToSingleEvent(weeklyEvent);

    // Then: 단일 일정 속성 확인
    expect(singleEvent.isRecurring).toBe(false);
    expect(singleEvent.isModified).toBe(true);
    expect(singleEvent.repeat.type).toBe('none');
  });
});
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-27  
**작성자**: AI Assistant  
**검토자**: 개발팀
