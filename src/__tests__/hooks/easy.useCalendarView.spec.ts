import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { useCalendarView } from '../../hooks/useCalendarView';
import { Event } from '../../types';

describe('useCalendarView - Easy Level', () => {
  let mockEvents: Event[];

  beforeEach(() => {
    mockEvents = [
      {
        id: 'event-1',
        title: '일일 회의',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '일일 스크럼 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
        notificationTime: 15,
      },
      {
        id: 'event-2',
        title: '주간 리뷰',
        date: '2025-01-20',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 진행상황 리뷰',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 30,
      },
      {
        id: 'event-3',
        title: '월간 계획',
        date: '2025-01-25',
        startTime: '16:00',
        endTime: '17:00',
        description: '월간 계획 수립',
        location: '회의실 C',
        category: '전략',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 60,
      },
    ];
  });

  describe('기본 상태 초기화', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useCalendarView());

      expect(result.current.currentDate).toBeDefined();
      expect(result.current.selectedDate).toBeDefined();
      expect(result.current.viewMode).toBe('month');
      expect(result.current.events).toEqual([]);
      expect(result.current.filteredEvents).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should initialize with provided events', () => {
      const { result } = renderHook(() => useCalendarView(mockEvents));

      expect(result.current.events).toEqual(mockEvents);
      expect(result.current.filteredEvents).toEqual(mockEvents);
    });
  });

  describe('날짜 네비게이션', () => {
    it('should navigate to next month', () => {
      const { result } = renderHook(() => useCalendarView());
      const initialDate = new Date(result.current.currentDate);

      act(() => {
        result.current.goToNextMonth();
      });

      const nextMonth = new Date(initialDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      expect(result.current.currentDate.getMonth()).toBe(nextMonth.getMonth());
    });

    it('should navigate to previous month', () => {
      const { result } = renderHook(() => useCalendarView());
      const initialDate = new Date(result.current.currentDate);

      act(() => {
        result.current.goToPreviousMonth();
      });

      const prevMonth = new Date(initialDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);

      expect(result.current.currentDate.getMonth()).toBe(prevMonth.getMonth());
    });

    it('should navigate to next year', () => {
      const { result } = renderHook(() => useCalendarView());
      const initialDate = new Date(result.current.currentDate);

      act(() => {
        result.current.goToNextYear();
      });

      const nextYear = new Date(initialDate);
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      expect(result.current.currentDate.getFullYear()).toBe(nextYear.getFullYear());
    });

    it('should navigate to previous year', () => {
      const { result } = renderHook(() => useCalendarView());
      const initialDate = new Date(result.current.currentDate);

      act(() => {
        result.current.goToPreviousYear();
      });

      const prevYear = new Date(initialDate);
      prevYear.setFullYear(prevYear.getFullYear() - 1);

      expect(result.current.currentDate.getFullYear()).toBe(prevYear.getFullYear());
    });

    it('should go to today', () => {
      const { result } = renderHook(() => useCalendarView());
      const today = new Date();

      act(() => {
        result.current.goToToday();
      });

      expect(result.current.currentDate.getDate()).toBe(today.getDate());
      expect(result.current.currentDate.getMonth()).toBe(today.getMonth());
      expect(result.current.currentDate.getFullYear()).toBe(today.getFullYear());
    });
  });

  describe('뷰 모드 변경', () => {
    it('should change view mode to week', () => {
      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.setViewMode('week');
      });

      expect(result.current.viewMode).toBe('week');
    });

    it('should change view mode to day', () => {
      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.setViewMode('day');
      });

      expect(result.current.viewMode).toBe('day');
    });

    it('should change view mode to month', () => {
      const { result } = renderHook(() => useCalendarView());

      // 먼저 다른 모드로 변경
      act(() => {
        result.current.setViewMode('week');
      });
      expect(result.current.viewMode).toBe('week');

      // month로 변경
      act(() => {
        result.current.setViewMode('month');
      });
      expect(result.current.viewMode).toBe('month');
    });
  });

  describe('날짜 선택', () => {
    it('should select a specific date', () => {
      const { result } = renderHook(() => useCalendarView());
      const targetDate = new Date('2025-02-15');

      act(() => {
        result.current.selectDate(targetDate);
      });

      expect(result.current.selectedDate.getDate()).toBe(targetDate.getDate());
      expect(result.current.selectedDate.getMonth()).toBe(targetDate.getMonth());
      expect(result.current.selectedDate.getFullYear()).toBe(targetDate.getFullYear());
    });

    it('should update selected date when current date changes', () => {
      const { result } = renderHook(() => useCalendarView());
      const initialSelectedDate = new Date(result.current.selectedDate);

      act(() => {
        result.current.goToNextMonth();
      });

      // selectedDate는 currentDate와 함께 업데이트되어야 함
      expect(result.current.selectedDate.getMonth()).toBe(result.current.currentDate.getMonth());
    });
  });

  describe('이벤트 관리 기본 동작', () => {
    it('should add new event', () => {
      const { result } = renderHook(() => useCalendarView());
      const newEvent: Event = {
        id: 'new-event',
        title: '새로운 일정',
        date: '2025-01-30',
        startTime: '10:00',
        endTime: '11:00',
        description: '새로 추가된 일정',
        location: '회의실 D',
        category: '개인',
        repeat: { type: 'none', interval: 1, endDate: '' },
        notificationTime: 10,
      };

      act(() => {
        result.current.addEvent(newEvent);
      });

      expect(result.current.events).toContain(newEvent);
      expect(result.current.filteredEvents).toContain(newEvent);
    });

    it('should remove event by id', () => {
      const { result } = renderHook(() => useCalendarView(mockEvents));
      const eventToRemove = mockEvents[0];

      act(() => {
        result.current.removeEvent(eventToRemove.id);
      });

      expect(result.current.events).not.toContain(eventToRemove);
      expect(result.current.filteredEvents).not.toContain(eventToRemove);
    });

    it('should update existing event', () => {
      const { result } = renderHook(() => useCalendarView(mockEvents));
      const eventToUpdate = mockEvents[0];
      const updatedEvent = { ...eventToUpdate, title: '수정된 제목' };

      act(() => {
        result.current.updateEvent(updatedEvent);
      });

      const foundEvent = result.current.events.find((e) => e.id === eventToUpdate.id);
      expect(foundEvent?.title).toBe('수정된 제목');
    });
  });

  describe('로딩 상태 관리', () => {
    it('should set loading state to true', () => {
      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      const { result } = renderHook(() => useCalendarView());

      // 먼저 로딩 상태로 설정
      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.isLoading).toBe(true);

      // 로딩 해제
      act(() => {
        result.current.setLoading(false);
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('에러 상태 관리', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useCalendarView());
      const errorMessage = '일정을 불러오는 중 오류가 발생했습니다.';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should clear error message', () => {
      const { result } = renderHook(() => useCalendarView());

      // 먼저 에러 설정
      act(() => {
        result.current.setError('에러 메시지');
      });
      expect(result.current.error).toBe('에러 메시지');

      // 에러 해제
      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('이벤트 검색 기본 동작', () => {
    it('should filter events by search term', () => {
      const { result } = renderHook(() => useCalendarView(mockEvents));

      act(() => {
        result.current.searchEvents('회의');
      });

      const filteredEvents = mockEvents.filter(
        (event) => event.title.includes('회의') || event.description.includes('회의')
      );
      expect(result.current.filteredEvents).toEqual(filteredEvents);
    });

    it('should show all events when search term is empty', () => {
      const { result } = renderHook(() => useCalendarView(mockEvents));

      act(() => {
        result.current.searchEvents('');
      });

      expect(result.current.filteredEvents).toEqual(mockEvents);
    });

    it('should show no events when search term has no matches', () => {
      const { result } = renderHook(() => useCalendarView(mockEvents));

      act(() => {
        result.current.searchEvents('존재하지 않는 일정');
      });

      expect(result.current.filteredEvents).toEqual([]);
    });
  });
});
