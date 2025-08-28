# 반복 일정 훅 테스트 가이드

## 🎯 개요

이 문서는 반복 일정 기능과 관련된 React 훅들의 테스트 방법을 설명합니다. TDD 방식으로 훅의 동작을 검증하고, 사용자 인터페이스와의 연동을 테스트합니다.

## 🧪 테스트 대상 훅들

### 1. `useEventForm` 훅

- **목적**: 반복 일정 생성 폼의 상태 관리
- **주요 기능**: 반복 유형 선택, 반복 종료 조건 설정, 일정 생성
- **테스트 레벨**: Easy → Medium → Hard

### 2. `useCalendarView` 훅

- **목적**: 반복 일정을 포함한 캘린더 뷰 관리
- **주요 기능**: 반복 일정 표시, 필터링, 그룹화
- **테스트 레벨**: Easy → Medium → Hard

### 3. `useEventOperations` 훅

- **목적**: 반복 일정의 수정, 삭제, 복원 작업
- **주요 기능**: 단일 수정, 단일 삭제, 일괄 작업
- **테스트 레벨**: Easy → Medium → Hard

### 4. `useNotifications` 훅

- **목적**: 반복 일정 알림 관리
- **주요 기능**: 알림 설정, 알림 전송, 알림 히스토리
- **테스트 레벨**: Easy → Medium → Hard

### 5. `useSearch` 훅

- **목적**: 반복 일정 검색 및 필터링
- **주요 기능**: 텍스트 검색, 날짜 범위 검색, 반복 유형별 검색
- **테스트 레벨**: Easy → Medium → Hard

## 📋 테스트 레벨별 접근법

### 🟢 Easy 레벨 (기본 기능)

- **목표**: 훅의 기본 동작 검증
- **범위**: 단순한 상태 변경, 기본 이벤트 처리
- **예시**: 반복 유형 변경, 기본 폼 입력

### 🟡 Medium 레벨 (상호작용)

- **목표**: 훅 간 상호작용 및 복잡한 로직 검증
- **범위**: 여러 훅의 조합, 에러 처리, 경계값
- **예시**: 반복 일정 생성 → 수정 → 삭제 플로우

### 🔴 Hard 레벨 (통합 및 엣지 케이스)

- **목표**: 전체 시스템 통합 및 복잡한 시나리오 검증
- **범위**: 성능 테스트, 메모리 누수, 동시성 이슈
- **예시**: 대량 일정 처리, 오프라인 상태 처리

## 🛠️ 테스트 도구 및 설정

### 테스트 환경

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
```

### Mock 설정

```typescript
// API 호출 모킹
vi.mock('../apis/fetchHolidays', () => ({
  fetchHolidays: vi.fn(),
}));

// 외부 의존성 모킹
vi.mock('../utils/recurringEvents', () => ({
  generateRecurringEvents: vi.fn(),
  modifySingleEvent: vi.fn(),
  deleteSingleEvent: vi.fn(),
}));
```

### 테스트 데이터

```typescript
const mockEventConfig = {
  startDate: '2025-01-15',
  endDate: '2025-12-31',
  repeatType: 'monthly' as RepeatType,
  maxOccurrences: 10,
};

const mockRecurringEvents = [
  // ... 테스트용 반복 일정 데이터
];
```

## ✅ 테스트 케이스 예시

### 기본 상태 테스트

```typescript
it('should initialize with default values', () => {
  const { result } = renderHook(() => useEventForm());

  expect(result.current.title).toBe('');
  expect(result.current.isRepeating).toBe(false);
  expect(result.current.repeatType).toBe('none');
});
```

### 상태 변경 테스트

```typescript
it('should update repeat type when changed', () => {
  const { result } = renderHook(() => useEventForm());

  act(() => {
    result.current.setRepeatType('monthly');
  });

  expect(result.current.repeatType).toBe('monthly');
  expect(result.current.isRepeating).toBe(true);
});
```

### 복잡한 로직 테스트

```typescript
it('should generate recurring events when form is submitted', async () => {
  const { result } = renderHook(() => useEventForm());

  // 폼 데이터 설정
  act(() => {
    result.current.setTitle('월간 회의');
    result.current.setDate('2025-01-15');
    result.current.setRepeatType('monthly');
    result.current.setRepeatEndDate('2025-12-31');
  });

  // 일정 생성 실행
  await act(async () => {
    await result.current.submitForm();
  });

  expect(result.current.events).toHaveLength(12);
  expect(result.current.events[0].isRecurring).toBe(true);
});
```

## 🚨 주의사항

### 1. 비동기 처리

- `act()` 함수로 비동기 상태 변경 래핑
- `waitFor()` 사용하여 비동기 결과 대기

### 2. 의존성 모킹

- 외부 API 호출 완전 모킹
- 실제 네트워크 요청 방지

### 3. 상태 격리

- 각 테스트마다 새로운 훅 인스턴스
- 이전 테스트의 상태 영향 방지

### 4. 메모리 누수 방지

- `cleanup()` 함수로 리소스 정리
- 이벤트 리스너 제거 확인

## 📊 테스트 커버리지 목표

### Easy 레벨

- **목표**: 90% 이상
- **범위**: 기본 상태 관리, 단순 이벤트 처리

### Medium 레벨

- **목표**: 80% 이상
- **범위**: 상호작용, 에러 처리, 경계값

### Hard 레벨

- **목표**: 70% 이상
- **범위**: 통합 시나리오, 성능, 엣지 케이스

## 🔄 테스트 실행

### 개별 훅 테스트

```bash
npm test -- --run src/__tests__/hooks/easy.useEventForm.spec.ts
npm test -- --run src/__tests__/hooks/medium.useEventForm.spec.ts
npm test -- --run src/__tests__/hooks/hard.useEventForm.spec.ts
```

### 전체 훅 테스트

```bash
npm test -- --run src/__tests__/hooks/
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-02-02  
**작성자**: AI Assistant  
**검토자**: 개발팀
