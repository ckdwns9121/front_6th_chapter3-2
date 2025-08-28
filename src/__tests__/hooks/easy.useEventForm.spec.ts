import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeEvent } from 'react';

import { useEventForm } from '../../hooks/useEventForm';
import { Event } from '../../types';

describe('useEventForm - Easy Level', () => {
  let mockEvent: Event;

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
  });

  describe('기본 상태 초기화', () => {
    it('should initialize with empty values when no initial event', () => {
      const { result } = renderHook(() => useEventForm());

      expect(result.current.title).toBe('');
      expect(result.current.date).toBe('');
      expect(result.current.startTime).toBe('');
      expect(result.current.endTime).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.location).toBe('');
      expect(result.current.category).toBe('업무');
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatType).toBe('none');
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.repeatEndDate).toBe('');
      expect(result.current.notificationTime).toBe(10);
    });

    it('should initialize with initial event values', () => {
      const { result } = renderHook(() => useEventForm(mockEvent));

      expect(result.current.title).toBe('테스트 일정');
      expect(result.current.date).toBe('2025-01-15');
      expect(result.current.startTime).toBe('09:00');
      expect(result.current.endTime).toBe('10:00');
      expect(result.current.description).toBe('테스트 설명');
      expect(result.current.location).toBe('회의실 A');
      expect(result.current.category).toBe('업무');
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatType).toBe('none');
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.repeatEndDate).toBe('');
      expect(result.current.notificationTime).toBe(15);
    });
  });

  describe('기본 상태 변경', () => {
    it('should update title when setTitle is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setTitle('새로운 제목');
      });

      expect(result.current.title).toBe('새로운 제목');
    });

    it('should update date when setDate is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setDate('2025-02-20');
      });

      expect(result.current.date).toBe('2025-02-20');
    });

    it('should update startTime when setStartTime is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setStartTime('14:30');
      });

      expect(result.current.startTime).toBe('14:30');
    });

    it('should update endTime when setEndTime is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setEndTime('16:00');
      });

      expect(result.current.endTime).toBe('16:00');
    });

    it('should update description when setDescription is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setDescription('새로운 설명');
      });

      expect(result.current.description).toBe('새로운 설명');
    });

    it('should update location when setLocation is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setLocation('회의실 B');
      });

      expect(result.current.location).toBe('회의실 B');
    });

    it('should update category when setCategory is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setCategory('개인');
      });

      expect(result.current.category).toBe('개인');
    });

    it('should update notificationTime when setNotificationTime is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setNotificationTime(30);
      });

      expect(result.current.notificationTime).toBe(30);
    });
  });

  describe('반복 설정 기본 동작', () => {
    it('should update repeatType when setRepeatType is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('daily');
      });

      expect(result.current.repeatType).toBe('daily');
    });

    it('should update repeatInterval when setRepeatInterval is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatInterval(2);
      });

      expect(result.current.repeatInterval).toBe(2);
    });

    it('should update repeatEndDate when setRepeatEndDate is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatEndDate('2025-12-31');
      });

      expect(result.current.repeatEndDate).toBe('2025-12-31');
    });

    it('should update isRepeating when repeatType changes from none', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('weekly');
      });

      expect(result.current.isRepeating).toBe(true);
    });

    it('should update isRepeating when repeatType changes to none', () => {
      const { result } = renderHook(() => useEventForm());

      // 먼저 반복 설정
      act(() => {
        result.current.setRepeatType('monthly');
      });
      expect(result.current.isRepeating).toBe(true);

      // none으로 변경
      act(() => {
        result.current.setRepeatType('none');
      });
      expect(result.current.isRepeating).toBe(false);
    });
  });

  describe('폼 리셋', () => {
    it('should reset form to initial empty state', () => {
      const { result } = renderHook(() => useEventForm(mockEvent));

      // 폼 데이터 변경
      act(() => {
        result.current.setTitle('변경된 제목');
        result.current.setDate('2025-03-01');
        result.current.setRepeatType('daily');
      });

      // 리셋 실행
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.title).toBe('');
      expect(result.current.date).toBe('');
      expect(result.current.startTime).toBe('');
      expect(result.current.endTime).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.location).toBe('');
      expect(result.current.category).toBe('업무');
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatType).toBe('none');
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.repeatEndDate).toBe('');
      expect(result.current.notificationTime).toBe(10);
    });
  });

  describe('이벤트 편집', () => {
    it('should load event data when editEvent is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.editEvent(mockEvent);
      });

      expect(result.current.title).toBe('테스트 일정');
      expect(result.current.date).toBe('2025-01-15');
      expect(result.current.startTime).toBe('09:00');
      expect(result.current.endTime).toBe('10:00');
      expect(result.current.description).toBe('테스트 설명');
      expect(result.current.location).toBe('회의실 A');
      expect(result.current.category).toBe('업무');
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatType).toBe('none');
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.repeatEndDate).toBe('');
      expect(result.current.notificationTime).toBe(15);
    });

    it('should update editingEvent state when editEvent is called', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.editEvent(mockEvent);
      });

      expect(result.current.editingEvent).toBe(mockEvent);
    });
  });

  describe('시간 검증 기본 동작', () => {
    it('should call handleStartTimeChange when start time changes', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.handleStartTimeChange({
          target: { value: '10:00' },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.startTime).toBe('10:00');
    });

    it('should call handleEndTimeChange when end time changes', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.handleEndTimeChange({
          target: { value: '11:00' },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.endTime).toBe('11:00');
    });
  });

  describe('반복 일정 생성 기능', () => {
    it('should initialize with empty generated events', () => {
      const { result } = renderHook(() => useEventForm());

      expect(result.current.generatedEvents).toEqual([]);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.generationError).toBeNull();
    });

    it('should generate recurring events when generateRecurringSeries is called', async () => {
      const { result } = renderHook(() => useEventForm());

      // 반복 설정
      act(() => {
        result.current.setTitle('일일 스크럼');
        result.current.setDate('2025-01-15');
        result.current.setStartTime('09:00');
        result.current.setEndTime('09:15');
        result.current.setRepeatType('daily');
        result.current.setRepeatEndDate('2025-01-20');
      });

      // 반복 일정 생성
      await act(async () => {
        await result.current.generateRecurringSeries();
      });

      expect(result.current.generatedEvents.length).toBeGreaterThan(0);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.generationError).toBeNull();
    });

    it('should preview recurring events', () => {
      const { result } = renderHook(() => useEventForm());

      // 반복 설정
      act(() => {
        result.current.setTitle('주간 회의');
        result.current.setDate('2025-01-15');
        result.current.setStartTime('14:00');
        result.current.setEndTime('15:00');
        result.current.setRepeatType('weekly');
        result.current.setRepeatEndDate('2025-03-15');
      });

      // 미리보기 실행
      const previewEvents = result.current.previewRecurringSeries();

      expect(previewEvents.length).toBeGreaterThan(0);
      expect(previewEvents.length).toBeLessThanOrEqual(10); // 최대 10개
    });

    it('should validate recurring settings', () => {
      const { result } = renderHook(() => useEventForm());

      // 유효하지 않은 반복 설정
      act(() => {
        result.current.setRepeatType('daily');
        // 날짜와 시간이 없음
      });

      const errors = result.current.validateRecurringSettings();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('날짜와 시간을 모두 입력해주세요.');

      // 유효한 반복 설정
      act(() => {
        result.current.setDate('2025-01-15');
        result.current.setStartTime('09:00');
        result.current.setEndTime('10:00');
      });

      const validErrors = result.current.validateRecurringSettings();
      expect(validErrors.length).toBe(0);
    });

    it('should clear generated events', () => {
      const { result } = renderHook(() => useEventForm());

      // 반복 설정 및 생성
      act(() => {
        result.current.setTitle('월간 회의');
        result.current.setDate('2025-01-15');
        result.current.setStartTime('16:00');
        result.current.setEndTime('17:00');
        result.current.setRepeatType('monthly');
      });

      // 미리보기로 이벤트 생성
      const previewEvents = result.current.previewRecurringSeries();
      expect(previewEvents.length).toBeGreaterThan(0);

      // 생성된 이벤트 초기화
      act(() => {
        result.current.clearGeneratedEvents();
      });

      expect(result.current.generatedEvents).toEqual([]);
      expect(result.current.generationError).toBeNull();
    });

    it('should handle generation errors gracefully', async () => {
      const { result } = renderHook(() => useEventForm());

      // 반복 설정 없이 생성 시도
      await act(async () => {
        await result.current.generateRecurringSeries();
      });

      expect(result.current.generationError).toBe('반복 설정이 필요합니다.');
      expect(result.current.generatedEvents).toEqual([]);
    });

    it('should handle 31st day monthly recurring events correctly', async () => {
      const { result } = renderHook(() => useEventForm());

      // 8월 31일에 매월 반복 설정
      act(() => {
        result.current.setTitle('월말 회의');
        result.current.setDate('2025-08-31');
        result.current.setStartTime('14:00');
        result.current.setEndTime('15:00');
        result.current.setRepeatType('monthly');
        result.current.setRepeatEndDate('2025-12-31');
      });

      // 반복 일정 생성
      await act(async () => {
        await result.current.generateRecurringSeries();
      });

      // 31일이 있는 달에만 일정이 생성되어야 함
      const generatedEvents = result.current.generatedEvents;
      expect(generatedEvents.length).toBeGreaterThan(0);

      // 8월, 10월, 12월에만 일정이 있어야 함 (9월, 11월은 31일이 없음)
      const dates = generatedEvents.map((event) => event.date);
      expect(dates).toContain('2025-08-31');
      expect(dates).toContain('2025-10-31');
      expect(dates).toContain('2025-12-31');

      // 9월, 11월에는 일정이 없어야 함
      expect(dates).not.toContain('2025-09-31');
      expect(dates).not.toContain('2025-11-31');
    });
  });
});
