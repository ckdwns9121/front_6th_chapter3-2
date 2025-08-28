import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useCalendarView } from '../../hooks/useCalendarView';

describe('useCalendarView - Easy Level', () => {
  describe('기본 상태 초기화', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useCalendarView());

      expect(result.current.view).toBe('month');
      expect(result.current.currentDate).toBeDefined();
      expect(result.current.holidays).toBeDefined();
    });

    it('should have correct initial view mode', () => {
      const { result } = renderHook(() => useCalendarView());

      expect(result.current.view).toBe('month');
    });

    it('should have current date initialized', () => {
      const { result } = renderHook(() => useCalendarView());
      const today = new Date();

      expect(result.current.currentDate.getDate()).toBe(today.getDate());
      expect(result.current.currentDate.getMonth()).toBe(today.getMonth());
      expect(result.current.currentDate.getFullYear()).toBe(today.getFullYear());
    });
  });

  describe('뷰 모드 변경', () => {
    it('should change view mode to week', () => {
      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.setView('week');
      });

      expect(result.current.view).toBe('week');
    });

    it('should change view mode to month', () => {
      const { result } = renderHook(() => useCalendarView());

      // 먼저 다른 모드로 변경
      act(() => {
        result.current.setView('week');
      });
      expect(result.current.view).toBe('week');

      // month로 변경
      act(() => {
        result.current.setView('month');
      });
      expect(result.current.view).toBe('month');
    });

    it('should maintain view mode after multiple changes', () => {
      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.setView('week');
      });
      expect(result.current.view).toBe('week');

      act(() => {
        result.current.setView('month');
      });
      expect(result.current.view).toBe('month');

      act(() => {
        result.current.setView('week');
      });
      expect(result.current.view).toBe('week');
    });
  });

  describe('날짜 네비게이션', () => {
    it('should navigate to next period', () => {
      const { result } = renderHook(() => useCalendarView());
      const initialDate = new Date(result.current.currentDate);

      act(() => {
        result.current.navigate('next');
      });

      // navigate 후 currentDate가 변경되었는지 확인
      expect(result.current.currentDate.getTime()).not.toBe(initialDate.getTime());
    });

    it('should navigate to previous period', () => {
      const { result } = renderHook(() => useCalendarView());
      const initialDate = new Date(result.current.currentDate);

      act(() => {
        result.current.navigate('prev');
      });

      // navigate 후 currentDate가 변경되었는지 확인
      expect(result.current.currentDate.getTime()).not.toBe(initialDate.getTime());
    });

    it('should navigate multiple times correctly', () => {
      const { result } = renderHook(() => useCalendarView());
      const initialDate = new Date(result.current.currentDate);

      // 여러 번 네비게이션
      act(() => {
        result.current.navigate('next');
      });

      // 첫 번째 navigate 후 currentDate가 변경되었는지 확인
      expect(result.current.currentDate.getTime()).not.toBe(initialDate.getTime());

      act(() => {
        result.current.navigate('next');
      });

      // 두 번째 navigate 후에도 currentDate가 변경되었는지 확인
      const secondNavigateDate = new Date(result.current.currentDate);
      expect(secondNavigateDate.getTime()).not.toBe(initialDate.getTime());

      act(() => {
        result.current.navigate('prev');
      });

      // 세 번째 navigate 후에도 currentDate가 변경되었는지 확인
      expect(result.current.currentDate.getTime()).not.toBe(initialDate.getTime());
    });
  });

  describe('현재 날짜 설정', () => {
    it('should set current date', () => {
      const { result } = renderHook(() => useCalendarView());
      const targetDate = new Date('2025-02-15');

      act(() => {
        result.current.setCurrentDate(targetDate);
      });

      expect(result.current.currentDate.getDate()).toBe(targetDate.getDate());
      expect(result.current.currentDate.getMonth()).toBe(targetDate.getMonth());
      expect(result.current.currentDate.getFullYear()).toBe(targetDate.getFullYear());
    });

    it('should update current date multiple times', () => {
      const { result } = renderHook(() => useCalendarView());
      const date1 = new Date('2025-01-01');
      const date2 = new Date('2025-03-15');

      act(() => {
        result.current.setCurrentDate(date1);
      });
      expect(result.current.currentDate.getMonth()).toBe(0); // January

      act(() => {
        result.current.setCurrentDate(date2);
      });
      expect(result.current.currentDate.getMonth()).toBe(2); // March
    });
  });

  describe('holidays 데이터', () => {
    it('should have holidays data structure', () => {
      const { result } = renderHook(() => useCalendarView());

      expect(result.current.holidays).toBeDefined();
      expect(typeof result.current.holidays).toBe('object');
    });

    it('should maintain holidays after view changes', () => {
      const { result } = renderHook(() => useCalendarView());
      const initialHolidays = result.current.holidays;

      act(() => {
        result.current.setView('week');
      });

      expect(result.current.holidays).toBe(initialHolidays);
    });
  });
});
