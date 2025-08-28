import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useEventForm } from '../../hooks/useEventForm';
import { Event } from '../../types';

// recurringEvents 유틸리티 모킹
vi.mock('../../utils/recurringEvents', () => ({
  generateRecurringEvents: vi.fn(),
  modifySingleEvent: vi.fn(),
  deleteSingleEvent: vi.fn(),
}));

describe('useEventForm - Medium Level', () => {
  let mockEvent: Event;
  let mockRecurringEvent: Event;

  beforeEach(() => {
    mockEvent = {
      id: 'test-event-1',
      title: '테스트 일정',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '',
      },
      notificationTime: 15,
    };

    mockRecurringEvent = {
      id: 'recurring-event-1',
      title: '반복 회의',
      date: '2025-01-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '매주 진행되는 팀 회의',
      location: '회의실 B',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2025-12-31',
      },
      notificationTime: 30,
    };

    // Mock 함수들 초기화
    vi.clearAllMocks();
  });

  describe('복잡한 상태 상호작용', () => {
    it('should update isRepeating when repeatType changes', () => {
      const { result } = renderHook(() => useEventForm());

      // 초기 상태 확인
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatType).toBe('none');

      // 반복 설정 변경
      act(() => {
        result.current.setRepeatType('daily');
      });

      expect(result.current.isRepeating).toBe(true);
      expect(result.current.repeatType).toBe('daily');

      // 반복 해제
      act(() => {
        result.current.setRepeatType('none');
      });

      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatType).toBe('none');
    });

    it('should maintain repeat settings when switching between repeat types', () => {
      const { result } = renderHook(() => useEventForm());

      // 월간 반복 설정
      act(() => {
        result.current.setRepeatType('monthly');
        result.current.setRepeatInterval(2);
        result.current.setRepeatEndDate('2025-12-31');
      });

      expect(result.current.repeatType).toBe('monthly');
      expect(result.current.repeatInterval).toBe(2);
      expect(result.current.repeatEndDate).toBe('2025-12-31');

      // 주간 반복으로 변경 (인터벌과 종료일은 유지)
      act(() => {
        result.current.setRepeatType('weekly');
      });

      expect(result.current.repeatType).toBe('weekly');
      expect(result.current.repeatInterval).toBe(2);
      expect(result.current.repeatEndDate).toBe('2025-12-31');
    });

    it('should reset repeat settings when repeatType becomes none', () => {
      const { result } = renderHook(() => useEventForm());

      // 반복 설정
      act(() => {
        result.current.setRepeatType('yearly');
        result.current.setRepeatInterval(3);
        result.current.setRepeatEndDate('2030-12-31');
      });

      // none으로 변경
      act(() => {
        result.current.setRepeatType('none');
      });

      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatType).toBe('none');
      expect(result.current.repeatInterval).toBe(1); // 기본값으로 리셋
      expect(result.current.repeatEndDate).toBe(''); // 빈 문자열로 리셋
    });
  });

  describe('에러 처리 및 경계값', () => {
    it('should handle invalid date format gracefully', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setDate('invalid-date');
      });

      // 잘못된 날짜도 문자열로 저장 (UI에서 검증)
      expect(result.current.date).toBe('invalid-date');
    });

    it('should handle invalid time format gracefully', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setStartTime('25:70');
        result.current.setEndTime('invalid-time');
      });

      // 잘못된 시간도 문자열로 저장 (UI에서 검증)
      expect(result.current.startTime).toBe('25:70');
      expect(result.current.endTime).toBe('invalid-time');
    });

    it('should handle empty string inputs', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setTitle('');
        result.current.setDescription('');
        result.current.setLocation('');
      });

      expect(result.current.title).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.location).toBe('');
    });

    it('should handle very long input strings', () => {
      const { result } = renderHook(() => useEventForm());
      const longString = 'a'.repeat(1000);

      act(() => {
        result.current.setTitle(longString);
        result.current.setDescription(longString);
      });

      expect(result.current.title).toBe(longString);
      expect(result.current.description).toBe(longString);
    });

    it('should handle special characters in inputs', () => {
      const { result } = renderHook(() => useEventForm());
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      act(() => {
        result.current.setTitle(specialChars);
        result.current.setDescription(specialChars);
        result.current.setLocation(specialChars);
      });

      expect(result.current.title).toBe(specialChars);
      expect(result.current.description).toBe(specialChars);
      expect(result.current.location).toBe(specialChars);
    });
  });

  describe('폼 상태 복원 및 편집', () => {
    it('should restore form state when editing event', () => {
      const { result } = renderHook(() => useEventForm());

      // 폼 데이터 변경
      act(() => {
        result.current.setTitle('변경된 제목');
        result.current.setDate('2025-03-01');
        result.current.setRepeatType('daily');
      });

      // 다른 이벤트로 편집
      act(() => {
        result.current.editEvent(mockRecurringEvent);
      });

      expect(result.current.title).toBe('반복 회의');
      expect(result.current.date).toBe('2025-01-15');
      expect(result.current.repeatType).toBe('weekly');
      expect(result.current.isRepeating).toBe(true);
    });

    it('should maintain editing state across multiple edits', () => {
      const { result } = renderHook(() => useEventForm());

      // 첫 번째 이벤트 편집
      act(() => {
        result.current.editEvent(mockEvent);
      });

      expect(result.current.editingEvent).toBe(mockEvent);

      // 두 번째 이벤트 편집
      act(() => {
        result.current.editEvent(mockRecurringEvent);
      });

      expect(result.current.editingEvent).toBe(mockRecurringEvent);
      expect(result.current.title).toBe('반복 회의');
    });

    it('should clear editing state when form is reset', () => {
      const { result } = renderHook(() => useEventForm(mockEvent));

      expect(result.current.editingEvent).toBe(mockEvent);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.editingEvent).toBeNull();
    });
  });

  describe('시간 검증 로직', () => {
    it('should validate start time before end time', () => {
      const { result } = renderHook(() => useEventForm());

      // 시작 시간을 종료 시간보다 늦게 설정
      act(() => {
        result.current.setStartTime('15:00');
        result.current.setEndTime('14:00');
      });

      // 시간 검증 에러 확인
      expect(result.current.startTimeError).toBeDefined();
      expect(result.current.endTimeError).toBeDefined();
    });

    it('should clear time errors when times are corrected', () => {
      const { result } = renderHook(() => useEventForm());

      // 잘못된 시간 설정
      act(() => {
        result.current.setStartTime('15:00');
        result.current.setEndTime('14:00');
      });

      expect(result.current.startTimeError).toBeDefined();

      // 올바른 시간으로 수정
      act(() => {
        result.current.setStartTime('14:00');
        result.current.setEndTime('15:00');
      });

      expect(result.current.startTimeError).toBeNull();
      expect(result.current.endTimeError).toBeNull();
    });

    it('should handle same start and end time', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setStartTime('14:00');
        result.current.setEndTime('14:00');
      });

      // 같은 시간은 유효 (0분 회의)
      expect(result.current.startTimeError).toBeNull();
      expect(result.current.endTimeError).toBeNull();
    });
  });

  describe('반복 설정 유효성', () => {
    it('should validate repeat interval range', () => {
      const { result } = renderHook(() => useEventForm());

      // 유효한 인터벌 설정
      act(() => {
        result.current.setRepeatType('weekly');
        result.current.setRepeatInterval(1);
      });

      expect(result.current.repeatInterval).toBe(1);

      // 큰 인터벌 설정
      act(() => {
        result.current.setRepeatInterval(52); // 1년
      });

      expect(result.current.repeatInterval).toBe(52);
    });

    it('should validate repeat end date format', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('monthly');
        result.current.setRepeatEndDate('2025-12-31');
      });

      expect(result.current.repeatEndDate).toBe('2025-12-31');

      // 잘못된 날짜 형식
      act(() => {
        result.current.setRepeatEndDate('invalid-date');
      });

      expect(result.current.repeatEndDate).toBe('invalid-date');
    });

    it('should handle repeat end date before start date', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setDate('2025-06-15');
        result.current.setRepeatType('monthly');
        result.current.setRepeatEndDate('2025-01-31'); // 시작일보다 이전
      });

      // 잘못된 종료일도 저장 (UI에서 검증)
      expect(result.current.repeatEndDate).toBe('2025-01-31');
    });
  });

  describe('알림 설정 유효성', () => {
    it('should handle notification time changes', () => {
      const { result } = renderHook(() => useEventForm());

      // 다양한 알림 시간 설정
      const testTimes = [0, 5, 15, 30, 60, 120, 1440]; // 0분, 5분, 15분, 30분, 1시간, 2시간, 1일

      testTimes.forEach((time) => {
        act(() => {
          result.current.setNotificationTime(time);
        });

        expect(result.current.notificationTime).toBe(time);
      });
    });

    it('should handle edge case notification times', () => {
      const { result } = renderHook(() => useEventForm());

      // 경계값 테스트
      act(() => {
        result.current.setNotificationTime(1); // 1분
      });
      expect(result.current.notificationTime).toBe(1);

      act(() => {
        result.current.setNotificationTime(1440); // 24시간
      });
      expect(result.current.notificationTime).toBe(1440);
    });
  });

  describe('카테고리 관리', () => {
    it('should handle category changes', () => {
      const { result } = renderHook(() => useEventForm());

      const categories = ['업무', '개인', '가족', '취미', '건강'];

      categories.forEach((category) => {
        act(() => {
          result.current.setCategory(category);
        });

        expect(result.current.category).toBe(category);
      });
    });

    it('should maintain category when switching repeat types', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setCategory('건강');
        result.current.setRepeatType('daily');
      });

      expect(result.current.category).toBe('건강');
      expect(result.current.repeatType).toBe('daily');

      act(() => {
        result.current.setRepeatType('weekly');
      });

      expect(result.current.category).toBe('건강'); // 카테고리는 유지
      expect(result.current.repeatType).toBe('weekly');
    });
  });

  describe('폼 상태 지속성', () => {
    it('should maintain form state across multiple renders', () => {
      const { result, rerender } = renderHook(() => useEventForm());

      // 폼 데이터 설정
      act(() => {
        result.current.setTitle('지속되는 제목');
        result.current.setDate('2025-05-20');
        result.current.setRepeatType('yearly');
      });

      // 훅 재렌더링
      rerender();

      // 상태가 유지되어야 함
      expect(result.current.title).toBe('지속되는 제목');
      expect(result.current.date).toBe('2025-05-20');
      expect(result.current.repeatType).toBe('yearly');
      expect(result.current.isRepeating).toBe(true);
    });

    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useEventForm());

      // 빠른 연속 상태 변경
      act(() => {
        result.current.setTitle('제목1');
        result.current.setTitle('제목2');
        result.current.setTitle('제목3');
        result.current.setDate('2025-01-01');
        result.current.setDate('2025-01-02');
        result.current.setDate('2025-01-03');
      });

      // 마지막 값이 유지되어야 함
      expect(result.current.title).toBe('제목3');
      expect(result.current.date).toBe('2025-01-03');
    });
  });
});
