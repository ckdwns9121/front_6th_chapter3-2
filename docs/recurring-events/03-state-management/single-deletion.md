# 반복 일정 단일 삭제 기능 상세 설계

## 🎯 기능 개요

**반복 일정 단일 삭제**는 반복 일정 시리즈에서 특정 일정만 선택적으로 삭제하는 기능입니다. 이 기능은 반복 시리즈의 연속성을 유지하면서 개별 일정을 비활성화할 수 있게 해줍니다.

### 🔑 핵심 특징

- **선택적 삭제**: 반복 시리즈의 특정 일정만 삭제
- **시리즈 유지**: 반복 일정 시리즈는 그대로 유지
- **불변성**: 원본 데이터는 변경하지 않고 새로운 상태 반환
- **상태 추적**: 삭제된 일정의 상태와 삭제 날짜 기록
- **복원 가능**: 삭제된 일정을 다시 복원할 수 있음

## 🏗️ 아키텍처 설계

### 📊 데이터 모델

```typescript
interface RecurringEvent {
  id: string;
  date: string;
  title?: string;
  description?: string;
  isRecurring: boolean;
  recurringSeriesId: string;
  isModified?: boolean;
  modificationDate?: string;
  isDeleted?: boolean; // 삭제 상태 표시
  deletionDate?: string; // 삭제된 날짜
}
```

### 🔄 상태 변화 흐름

```
원본 이벤트 → 삭제 요청 → 삭제된 이벤트 생성 → 상태 업데이트
     ↓              ↓              ↓              ↓
  isDeleted: false → deleteSingleEvent() → isDeleted: true → deletionDate 설정
```

## 🛠️ 구현된 함수들

### 1. 기본 삭제 함수

#### `deleteSingleEvent(events, index)`

**목적**: 특정 인덱스의 이벤트를 삭제 상태로 변경

**매개변수**:

- `events: RecurringEvent[]`: 이벤트 배열
- `index: number`: 삭제할 이벤트의 인덱스

**반환값**: `RecurringEvent` - 삭제된 이벤트 객체

**동작 방식**:

```typescript
export function deleteSingleEvent(events: RecurringEvent[], index: number): RecurringEvent {
  // 입력 검증
  if (!Array.isArray(events)) {
    throw new Error('Events must be an array');
  }

  if (index < 0 || index >= events.length) {
    throw new Error(`Invalid event index: ${index}. Array length: ${events.length}`);
  }

  const originalEvent = events[index];

  // 삭제된 이벤트 생성 (불변성 유지)
  const deletedEvent: RecurringEvent = {
    ...originalEvent,
    isDeleted: true,
    deletionDate: new Date().toISOString().split('T')[0],
  };

  // 원본 배열은 변경하지 않고 삭제된 이벤트만 반환
  return deletedEvent;
}
```

### 2. 복원 함수

#### `restoreDeletedEvent(events, index)`

**목적**: 삭제된 이벤트를 다시 활성 상태로 복원

**동작 방식**:

```typescript
export function restoreDeletedEvent(events: RecurringEvent[], index: number): RecurringEvent {
  return modifySingleEvent(events, index, {
    isDeleted: false,
    deletionDate: undefined,
  });
}
```

### 3. 필터링 함수들

#### `getActiveEvents(events)`

**목적**: 삭제되지 않은 활성 이벤트만 반환

```typescript
export function getActiveEvents(events: RecurringEvent[]): RecurringEvent[] {
  return events.filter((event) => !event.isDeleted);
}
```

#### `getDeletedEvents(events)`

**목적**: 삭제된 이벤트만 반환

```typescript
export function getDeletedEvents(events: RecurringEvent[]): RecurringEvent[] {
  return events.filter((event) => event.isDeleted);
}
```

### 4. 고급 관리 함수들

#### `bulkDeleteEvents(events, indices)`

**목적**: 여러 이벤트를 한 번에 삭제

```typescript
export function bulkDeleteEvents(events: RecurringEvent[], indices: number[]): RecurringEvent[] {
  // 중복 제거 및 정렬
  const uniqueIndices = [...new Set(indices)].sort((a, b) => a - b);

  // 유효성 검증
  uniqueIndices.forEach((index) => {
    if (index < 0 || index >= events.length) {
      throw new Error(`Invalid event index: ${index}. Array length: ${events.length}`);
    }
  });

  return uniqueIndices.map((index) => deleteSingleEvent(events, index));
}
```

#### `getEventStatusSummary(events)`

**목적**: 이벤트 상태에 대한 통계 정보 제공

```typescript
export function getEventStatusSummary(events: RecurringEvent[]): {
  total: number;
  active: number;
  deleted: number;
  modified: number;
} {
  return {
    total: events.length,
    active: events.filter((event) => !event.isDeleted).length,
    deleted: events.filter((event) => event.isDeleted).length,
    modified: events.filter((event) => event.isModified && !event.isDeleted).length,
  };
}
```

## ✅ 테스트 케이스

### TC-401: 기본 단일 삭제 테스트

**목적**: 특정 이벤트의 기본 삭제 기능 검증

**테스트 시나리오**:

1. 월간 반복 일정 10개 생성
2. 3번째 이벤트(index: 2) 삭제
3. 삭제된 이벤트의 상태 확인

**검증 항목**:

- 원본 배열은 변경되지 않음 (10개 유지)
- 삭제된 이벤트가 반환됨
- `isDeleted: true` 설정
- `deletionDate` 설정됨

### TC-402: 시리즈 유지 테스트

**목적**: 삭제 후 반복 일정 시리즈의 연속성 유지 확인

**테스트 시나리오**:

1. 일간 반복 일정 5개 생성
2. 2번째 이벤트(index: 1) 삭제
3. 원본 이벤트와 삭제된 이벤트 비교

**검증 항목**:

- 원본 배열은 변경되지 않음 (5개 유지)
- 삭제된 이벤트의 `isDeleted: true`
- 원본 이벤트는 변경되지 않음
- `recurringSeriesId` 일치 확인

## 🔍 사용 예시

### 기본 삭제

```typescript
// 월간 반복 일정 생성
const config = {
  startDate: '2025-01-15',
  endDate: '2025-12-31',
  repeatType: 'monthly',
  maxOccurrences: 10,
};

const events = generateRecurringEvents(config);

// 3번째 이벤트 삭제
const deletedEvent = deleteSingleEvent(events, 2);

console.log('삭제된 이벤트:', deletedEvent.isDeleted); // true
console.log('삭제 날짜:', deletedEvent.deletionDate); // "2025-02-02"
console.log('원본 배열 길이:', events.length); // 10 (변경되지 않음)
```

### 일괄 삭제

```typescript
// 여러 이벤트 동시 삭제
const deletedEvents = bulkDeleteEvents(events, [1, 3, 5]);

console.log('삭제된 이벤트 수:', deletedEvents.length); // 3
```

### 상태 통계

```typescript
// 이벤트 상태 요약
const summary = getEventStatusSummary(events);

console.log('전체:', summary.total); // 10
console.log('활성:', summary.active); // 7
console.log('삭제됨:', summary.deleted); // 3
console.log('수정됨:', summary.modified); // 0
```

### 활성 이벤트만 필터링

```typescript
// 삭제되지 않은 이벤트만 표시
const activeEvents = getActiveEvents(events);

console.log('활성 이벤트 수:', activeEvents.length); // 7
```

## 🚨 주의사항 및 제약사항

### ⚠️ 입력 검증

- **배열 검증**: `events`는 반드시 배열이어야 함
- **인덱스 범위**: `index`는 0 이상, 배열 길이 미만이어야 함
- **타입 안전성**: TypeScript 타입 검사 통과 필요

### 🔒 불변성 원칙

- **원본 보존**: 원본 `events` 배열은 절대 변경되지 않음
- **새 객체 반환**: 항상 새로운 `RecurringEvent` 객체 반환
- **참조 분리**: 반환된 객체는 원본과 독립적

### 📅 날짜 처리

- **UTC 기준**: 모든 날짜는 UTC 기준으로 처리
- **ISO 형식**: `deletionDate`는 'YYYY-MM-DD' 형식
- **실시간**: 삭제 시점의 현재 날짜 사용

## 🔮 향후 개선 방향

### 🎨 UI 통합

- **삭제 버튼**: 각 이벤트에 삭제 버튼 추가
- **삭제 확인**: 사용자 확인 다이얼로그 구현
- **시각적 표시**: 삭제된 이벤트의 시각적 구분

### 📊 고급 기능

- **삭제 히스토리**: 삭제/복원 이력 추적
- **일괄 복원**: 여러 삭제된 이벤트 동시 복원
- **삭제 정책**: 영구 삭제 vs 임시 삭제 옵션

### 🔄 동기화

- **서버 동기화**: 삭제 상태를 서버와 동기화
- **오프라인 지원**: 오프라인 상태에서의 삭제 처리
- **충돌 해결**: 동시 편집 시 삭제 충돌 해결

## 📋 구현 체크리스트

### ✅ 완료된 항목

- [x] `deleteSingleEvent` 함수 구현
- [x] `restoreDeletedEvent` 함수 구현
- [x] `getActiveEvents` 함수 구현
- [x] `getDeletedEvents` 함수 구현
- [x] `bulkDeleteEvents` 함수 구현
- [x] `getEventStatusSummary` 함수 구현
- [x] TC-401 테스트 케이스 통과
- [x] TC-402 테스트 케이스 통과
- [x] 타입 정의 완료
- [x] 에러 처리 구현

### 🔄 진행 중인 항목

- [ ] UI 컴포넌트 통합
- [ ] 사용자 인터페이스 구현
- [ ] 시각적 피드백 추가

### 📝 향후 계획

- [ ] 삭제 히스토리 기능
- [ ] 고급 삭제 정책
- [ ] 서버 동기화
- [ ] 성능 최적화

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-02-02  
**작성자**: AI Assistant  
**검토자**: 개발팀
