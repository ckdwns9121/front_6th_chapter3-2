# 윤년 29일 처리 엣지 케이스 상세 설계

## 📋 개요
2월 29일에 매년 반복을 선택했을 때의 윤년 처리 로직을 구현합니다.

## 🎯 요구사항
- 2월 29일에 매년 반복 시 29일에만 생성
- 윤년이 아닌 해는 건너뛰기
- 윤년 판별 로직 정확성 보장

## 🧪 테스트 케이스

### TC-201: 윤년 29일 매년 반복 - 기본 케이스
**설명**: 2월 29일에 매년 반복 시 윤년에만 생성되는지 확인

**Given**:
```typescript
const config = {
  startDate: '2024-02-29', // 2024년은 윤년
  endDate: '2032-12-31',
  repeatType: 'yearly',
  maxOccurrences: 10
};
```

**When**:
```typescript
const events = generateRecurringEvents(config);
```

**Then**:
- 생성된 일정 수: 3개 (2024, 2028, 2032년)
- 2025, 2026, 2027, 2029, 2030, 2031년은 건너뛰기
- 모든 일정이 2월 29일에 생성됨

**테스트 코드**:
```typescript
describe('윤년 29일 매년 반복', () => {
  it('윤년에만 2월 29일에 생성한다', () => {
    // Given
    const config = {
      startDate: '2024-02-29',
      endDate: '2032-12-31',
      repeatType: 'yearly' as RepeatType,
      maxOccurrences: 10
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
});
```

### TC-202: 윤년 29일 매년 반복 - 경계값 테스트
**설명**: 윤년과 평년의 경계에서의 처리

**Given**:
```typescript
const config = {
  startDate: '2024-02-29',
  endDate: '2025-12-31',
  repeatType: 'yearly',
  maxOccurrences: 10
};
```

**When**:
```typescript
const events = generateRecurringEvents(config);
```

**Then**:
- 생성된 일정 수: 1개
- 첫 번째: 2024-02-29
- 2025년은 건너뛰기 (평년)

### TC-203: 윤년 29일 매년 반복 - 100년 규칙
**설명**: 100년마다 윤년이 아닌 경우 처리

**Given**:
```typescript
const config = {
  startDate: '2000-02-29', // 2000년은 윤년 (400으로 나누어떨어짐)
  endDate: '2100-12-31',
  repeatType: 'yearly',
  maxOccurrences: 10
};
```

**When**:
```typescript
const events = generateRecurringEvents(config);
```

**Then**:
- 생성된 일정 수: 1개
- 2000년만 생성 (2100년은 100년 규칙으로 윤년 아님)

### TC-204: 윤년 29일 매년 반복 - 400년 규칙
**설명**: 400년마다 윤년인 경우 처리

**Given**:
```typescript
const config = {
  startDate: '2000-02-29',
  endDate: '2400-12-31',
  repeatType: 'yearly',
  maxOccurrences: 10
};
```

**When**:
```typescript
const events = generateRecurringEvents(config);
```

**Then**:
- 생성된 일정 수: 2개
- 2000년, 2400년 생성 (둘 다 400으로 나누어떨어짐)

## 🏗️ 구현 세부사항

### 윤년 판별 로직
```typescript
/**
 * 특정 연도가 윤년인지 확인하는 함수
 * @param year 확인할 연도
 * @returns 윤년 여부
 */
export function isLeapYear(year: number): boolean {
  // 4로 나누어떨어지고, 100으로 나누어떨어지지 않거나
  // 400으로 나누어떨어지는 해가 윤년
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
```

### 핵심 로직
```typescript
case 'yearly': {
  const nextYear = new Date(currentDate);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  
  // 윤년 2월 29일 처리
  if (currentDate.getMonth() === 1 && currentDate.getDate() === 29) {
    if (!isLeapYear(nextYear.getFullYear())) {
      // 다음 해가 윤년이 아니면 건너뛰기
      currentDate = nextYear;
      continue;
    }
  }
  
  currentDate = nextYear;
  break;
}
```

### 헬퍼 함수
```typescript
/**
 * 특정 연도의 2월 29일이 존재하는지 확인
 * @param year 확인할 연도
 * @returns 2월 29일 존재 여부
 */
export function hasFebruary29th(year: number): boolean {
  return isLeapYear(year);
}

/**
 * 다음 윤년을 찾는 함수
 * @param year 시작 연도
 * @returns 다음 윤년
 */
export function findNextLeapYear(year: number): number {
  let nextYear = year + 1;
  while (!isLeapYear(nextYear)) {
    nextYear++;
  }
  return nextYear;
}
```

## ✅ 완료 기준
- [ ] TC-201 테스트 통과
- [ ] TC-202 테스트 통과
- [ ] TC-203 테스트 통과
- [ ] TC-204 테스트 통과
- [ ] 윤년 판별 로직 구현 완료
- [ ] 2월 29일 건너뛰기 로직 구현 완료
- [ ] 100년, 400년 규칙 구현 완료

## ⚠️ 주의사항
- 윤년 판별 규칙의 정확성 (4, 100, 400년 규칙)
- 경계값 테스트의 중요성
- 성능: 윤년 판별 로직의 효율성
- 국제 표준 준수 (그레고리력)

## 🔄 TDD 사이클

### 🔴 Red Phase
- TC-201, TC-202, TC-203, TC-204 테스트 작성
- 테스트 실행하여 실패 확인

### 🟢 Green Phase
- 최소한의 구현으로 테스트 통과
- 윤년 판별 로직 구현
- 2월 29일 건너뛰기 로직 구현

### 🔄 Refactor Phase
- 윤년 판별 로직 최적화
- 헬퍼 함수 추출
- 코드 가독성 개선

## 📊 테스트 데이터

### 윤년 테스트 데이터
```typescript
export const LEAP_YEAR_TEST_DATA = {
  LEAP_YEARS: [2000, 2004, 2008, 2012, 2016, 2020, 2024, 2028, 2032],
  NON_LEAP_YEARS: [2001, 2002, 2003, 2005, 2006, 2007, 2009, 2010, 2011],
  CENTURY_YEARS: [1900, 2000, 2100, 2200, 2300, 2400],
  CENTURY_LEAP_YEARS: [2000, 2400], // 400으로 나누어떨어지는 해만
  CENTURY_NON_LEAP_YEARS: [1900, 2100, 2200, 2300] // 100으로 나누어떨어지지만 400으로는 안 되는 해
};
```

### 윤년 판별 테스트
```typescript
describe('윤년 판별', () => {
  it('일반적인 윤년을 올바르게 판별한다', () => {
    LEAP_YEAR_TEST_DATA.LEAP_YEARS.forEach(year => {
      expect(isLeapYear(year)).toBe(true);
    });
  });
  
  it('일반적인 평년을 올바르게 판별한다', () => {
    LEAP_YEAR_TEST_DATA.NON_LEAP_YEARS.forEach(year => {
      expect(isLeapYear(year)).toBe(false);
    });
  });
  
  it('100년 규칙을 올바르게 적용한다', () => {
    LEAP_YEAR_TEST_DATA.CENTURY_NON_LEAP_YEARS.forEach(year => {
      expect(isLeapYear(year)).toBe(false);
    });
  });
  
  it('400년 규칙을 올바르게 적용한다', () => {
    LEAP_YEAR_TEST_DATA.CENTURY_LEAP_YEARS.forEach(year => {
      expect(isLeapYear(year)).toBe(true);
    });
  });
});
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-27  
**작성자**: AI Assistant  
**검토자**: 개발팀
