# 테스트 실행 가이드

## 📋 개요
반복 일정 기능의 테스트를 체계적으로 실행하기 위한 가이드입니다.

## 🚀 테스트 환경 설정

### 1. 의존성 설치
```bash
# 프로젝트 루트에서 실행
npm install

# 테스트 관련 의존성 확인
npm list jest @testing-library/react @testing-library/jest-dom
```

### 2. 테스트 스크립트 확인
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --config jest.integration.config.js"
  }
}
```

## 🧪 테스트 실행 방법

### 기본 테스트 실행
```bash
# 모든 테스트 실행
npm test

# 테스트 감시 모드 (파일 변경 시 자동 실행)
npm run test:watch

# 테스트 커버리지 확인
npm run test:coverage
```

### 특정 테스트 실행
```bash
# 특정 파일의 테스트만 실행
npm test -- src/__tests__/unit/recurringEvents.test.ts

# 특정 테스트 패턴 실행
npm test -- --testNamePattern="매일 반복"

# 특정 폴더의 테스트만 실행
npm test -- src/__tests__/unit/
```

## 📁 테스트 파일 구조

```
src/__tests__/
├── unit/                           # 단위 테스트
│   ├── recurringEvents.test.ts     # 반복 일정 생성 로직
│   ├── dateUtils.test.ts          # 날짜 유틸리티
│   └── eventOperations.test.ts    # 이벤트 작업
├── integration/                    # 통합 테스트
│   ├── eventManagement.test.ts    # 이벤트 관리 워크플로우
│   └── recurringEventWorkflow.test.ts # 반복 일정 워크플로우
└── e2e/                           # E2E 테스트
    └── recurringEventScenarios.test.ts # 사용자 시나리오
```

## 🔄 TDD 사이클별 테스트 실행

### Phase 1: 핵심 로직 테스트

#### 1단계: 매일 반복 테스트
```bash
# TC-001 테스트 작성 후 실행
npm test -- --testNamePattern="TC-001"

# 예상 결과: 테스트 실패 (Red Phase)
# - generateRecurringEvents 함수가 정의되지 않음
# - 또는 함수는 존재하지만 로직이 구현되지 않음
```

#### 2단계: 최소 구현 후 테스트
```bash
# 최소한의 구현 후 테스트 실행
npm test -- --testNamePattern="TC-001"

# 예상 결과: 테스트 통과 (Green Phase)
# - 기본적인 매일 반복 로직 구현
# - 테스트는 통과하지만 실제 로직은 미완성
```

#### 3단계: 리팩토링 후 테스트
```bash
# 코드 개선 후 테스트 실행
npm test -- --testNamePattern="TC-001"

# 예상 결과: 테스트 통과 (Refactor Phase)
# - 코드 품질 개선
# - 성능 최적화
# - 에러 처리 강화
```

### Phase 2: 엣지 케이스 테스트

#### 31일 처리 테스트
```bash
# 31일 처리 테스트 실행
npm test -- --testNamePattern="31일 매월 반복"

# 포함된 테스트 케이스:
# - TC-101: 31일 매월 반복 - 정상 케이스
# - TC-102: 31일 매월 반복 - 경계값 테스트
# - TC-103: 31일 매월 반복 - 윤년 고려
```

#### 윤년 29일 처리 테스트
```bash
# 윤년 29일 처리 테스트 실행
npm test -- --testNamePattern="윤년 29일 매년 반복"

# 포함된 테스트 케이스:
# - TC-201: 윤년 29일 매년 반복 - 기본 케이스
# - TC-202: 윤년 29일 매년 반복 - 경계값 테스트
# - TC-203: 윤년 29일 매년 반복 - 100년 규칙
# - TC-204: 윤년 29일 매년 반복 - 400년 규칙
```

## 📊 테스트 커버리지 확인

### 커버리지 실행
```bash
# 전체 커버리지 확인
npm run test:coverage

# 특정 파일 커버리지 확인
npm test -- --coverage --collectCoverageFrom="src/utils/recurringEvents.ts"
```

### 커버리지 목표
- **Unit Tests**: 90% 이상
- **Integration Tests**: 80% 이상
- **Critical Paths**: 100%

### 커버리지 리포트 해석
```
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |    85.7 |     80.0 |    83.3 |    85.7 |
 recurring |    85.7 |     80.0 |    83.3 |    85.7 | 15,23,45-47
 Events.ts|         |          |         |         |
----------|---------|----------|---------|---------|-------------------
```

## 🐛 테스트 디버깅

### 테스트 실패 시 디버깅
```bash
# 상세한 테스트 출력
npm test -- --verbose

# 특정 테스트만 실행하여 디버깅
npm test -- --testNamePattern="TC-001" --verbose

# 테스트 타임아웃 증가
npm test -- --testTimeout=10000
```

### Jest 디버거 사용
```bash
# Node.js 디버거로 테스트 실행
node --inspect-brk node_modules/.bin/jest --runInBand --testNamePattern="TC-001"
```

### VS Code 디버깅 설정
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--testNamePattern", "TC-001"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 📝 테스트 작성 가이드

### 테스트 케이스 구조
```typescript
describe('기능명', () => {
  it('TC-XXX: 테스트 설명', () => {
    // Given: 테스트 데이터 준비
    const input = { /* 테스트 입력 */ };
    
    // When: 테스트 대상 함수 실행
    const result = functionUnderTest(input);
    
    // Then: 결과 검증
    expect(result).toBe(expectedValue);
  });
});
```

### 테스트 데이터 팩토리 사용
```typescript
import { createRecurringEvent } from '../test-utils/eventFactory';

describe('반복 일정 테스트', () => {
  it('매일 반복 일정을 생성한다', () => {
    // Given: 팩토리를 사용한 테스트 데이터 생성
    const event = createRecurringEvent({
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' }
    });
    
    // When & Then: 테스트 로직
    expect(event.repeat.type).toBe('daily');
  });
});
```

## 🔍 테스트 결과 분석

### 테스트 통과/실패 확인
```bash
# 테스트 결과 요약
npm test -- --silent

# 실패한 테스트만 확인
npm test -- --verbose --testFailureExitCode=1
```

### 성능 테스트
```bash
# 테스트 실행 시간 측정
time npm test

# 특정 테스트의 성능 측정
npm test -- --testNamePattern="TC-001" --verbose
```

## 📋 일일 테스트 체크리스트

### Day 1: 기본 설정
- [ ] 테스트 환경 설정 완료
- [ ] 첫 번째 테스트 케이스 작성
- [ ] 테스트 실행 및 실패 확인

### Day 2: 기본 로직
- [ ] TC-001 테스트 통과
- [ ] TC-002, TC-003 테스트 작성
- [ ] 매일 반복 로직 완성

### Day 3: 엣지 케이스
- [ ] TC-101, TC-102 테스트 작성
- [ ] 31일 처리 로직 구현
- [ ] TC-201 테스트 작성

### Day 4: 상태 관리
- [ ] TC-301 테스트 작성
- [ ] 단일 수정 로직 구현
- [ ] 통합 테스트 시작

### Day 5: UI 통합
- [ ] UI 컴포넌트 테스트 작성
- [ ] E2E 테스트 시작
- [ ] 전체 테스트 커버리지 확인

## 🚨 문제 해결

### 일반적인 테스트 문제

#### 1. 테스트가 실행되지 않음
```bash
# Jest 설정 확인
npx jest --showConfig

# 테스트 파일 패턴 확인
npm test -- --listTests
```

#### 2. 모듈을 찾을 수 없음
```bash
# TypeScript 설정 확인
npx tsc --noEmit

# 경로 별칭 확인
npm test -- --moduleNameMapper
```

#### 3. 테스트 타임아웃
```bash
# 타임아웃 증가
npm test -- --testTimeout=30000

# 비동기 테스트 확인
npm test -- --testNamePattern="async"
```

## 📚 추가 리소스

### Jest 공식 문서
- [Jest Getting Started](https://jestjs.io/docs/getting-started)
- [Jest Configuration](https://jestjs.io/docs/configuration)
- [Jest API Reference](https://jestjs.io/docs/api)

### React Testing Library
- [React Testing Library Guide](https://testing-library.com/docs/react-testing-library/intro/)
- [Common Testing Patterns](https://testing-library.com/docs/guiding-principles)

### TDD 관련 자료
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)
- [Red-Green-Refactor Cycle](https://www.agilealliance.org/glossary/tdd/)

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-27  
**작성자**: AI Assistant  
**검토자**: 개발팀
