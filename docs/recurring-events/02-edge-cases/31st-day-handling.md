# 31일 처리 엣지 케이스 상세 설계

## 📋 개요
31일에 매월 반복을 선택했을 때의 특수한 처리 로직을 구현합니다.

## 🎯 요구사항
- 31일에 매월 반복 시 31일에만 생성
- 2월, 4월, 6월, 9월, 11월은 건너뛰기
- 1월, 3월, 5월, 7월, 8월, 10월, 12월에만 생성

## 🧪 테스트 케이스

### TC-101: 31일 매월 반복 - 정상 케이스
**설명**: 31일이 있는 달에만 생성되는지 확인

**Given**:
```typescript
const config = {
  startDate: '2025-01-31',
  endDate: '2025-12-31',
  repeatType: 'monthly',
  maxOccurrences: 10
};
```

**When**:
```typescript
const events = generateRecurringEvents(config);
```

**Then**:
- 생성된 일정 수: 7개 (31일이 있는 달만)
- 생성되는 달: 1, 3, 5, 7, 8, 10, 12월
- 건너뛰는 달: 2, 4, 6, 9, 11월

**테스트 코드**:
```typescript
describe('31일 매월 반복', () => {
  it('31일이 있는 달에만 생성한다', () => {
    // Given
    const config = {
      startDate: '2025-01-31',
      endDate: '2025-12-31',
      repeatType: 'monthly' as RepeatType,
      maxOccurrences: 10
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
```

### TC-102: 31일 매월 반복 - 경계값 테스트
**설명**: 2월과 같은 31일이 없는 달에서의 처리

**Given**:
```typescript
const config = {
  startDate: '2025-01-31',
  endDate: '2025-03-31',
  repeatType: 'monthly',
  maxOccurrences: 10
};
```

**When**:
```typescript
const events = generateRecurringEvents(config);
```

**Then**:
- 생성된 일정 수: 2개
- 첫 번째: 2025-01-31
- 두 번째: 2025-03-31
- 2월은 건너뛰기

### TC-103: 31일 매월 반복 - 윤년 고려
**설명**: 윤년 2월에서의 31일 처리

**Given**:
```typescript
const config = {
  startDate: '2024-01-31',
  endDate: '2024-12-31',
  repeatType: 'monthly',
  maxOccurrences: 10
};
```

**When**:
```typescript
const events = generateRecurringEvents(config);
```

**Then**:
- 생성된 일정 수: 7개
- 2월은 여전히 건너뛰기 (윤년이어도 31일은 없음)

## 🏗️ 구현 세부사항

### 핵심 로직
```typescript
case 'monthly': {
  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  // 31일 처리
  if (currentDate.getDate() === 31) {
    const lastDayOfNextMonth = new Date(
      nextMonth.getFullYear(), 
      nextMonth.getMonth() + 1, 
      0
    );
    
    if (lastDayOfNextMonth.getDate() < 31) {
      // 다음 달에 31일이 없으면 건너뛰기
      currentDate = nextMonth;
      continue;
    }
  }
  
  currentDate = nextMonth;
  break;
}
```

### 헬퍼 함수
```typescript
/**
 * 특정 월의 마지막 날짜를 반환하는 함수
 * @param year 연도
 * @param month 월 (0-11, 0=1월)
 * @returns 해당 월의 마지막 날짜
 */
export function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 특정 날짜가 해당 월의 마지막 날인지 확인
 * @param date 확인할 날짜
 * @returns 마지막 날 여부
 */
export function isLastDayOfMonth(date: Date): boolean {
  const lastDay = getLastDayOfMonth(date.getFullYear(), date.getMonth());
  return date.getDate() === lastDay;
}
```

### 월별 31일 존재 여부
```typescript
const MONTHS_WITH_31_DAYS = new Set([1, 3, 5, 7, 8, 10, 12]);

export function has31Days(month: number): boolean {
  return MONTHS_WITH_31_DAYS.has(month);
}
```

## ✅ 완료 기준
- [ ] TC-101 테스트 통과
- [ ] TC-102 테스트 통과
- [ ] TC-103 테스트 통과
- [ ] 31일 처리 로직 구현 완료
- [ ] 건너뛰기 로직 구현 완료
- [ ] 날짜 계산 정확성 검증

## ⚠️ 주의사항
- 월말 날짜 계산 정확성 확인
- 윤년 2월 처리와의 연관성
- 성능: 건너뛰기 로직의 효율성
- 경계값 테스트 중요성

## 🔄 TDD 사이클

### 🔴 Red Phase
- TC-101, TC-102, TC-103 테스트 작성
- 테스트 실행하여 실패 확인

### 🟢 Green Phase
- 최소한의 구현으로 테스트 통과
- 31일 건너뛰기 로직 구현

### 🔄 Refactor Phase
- 헬퍼 함수 추출
- 성능 최적화
- 코드 가독성 개선

## 📊 테스트 데이터

### 테스트용 날짜 데이터
```typescript
export const TEST_DATES = {
  JAN_31: '2025-01-31',
  FEB_28: '2025-02-28',
  MAR_31: '2025-03-31',
  APR_30: '2025-04-30',
  MAY_31: '2025-05-31',
  JUN_30: '2025-06-30',
  JUL_31: '2025-07-31',
  AUG_31: '2025-08-31',
  SEP_30: '2025-09-30',
  OCT_31: '2025-10-31',
  NOV_30: '2025-11-30',
  DEC_31: '2025-12-31'
};
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-27  
**작성자**: AI Assistant  
**검토자**: 개발팀
