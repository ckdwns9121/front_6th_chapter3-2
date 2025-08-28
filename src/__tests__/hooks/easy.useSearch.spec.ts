import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { useSearch } from '../../hooks/useSearch';
import { Event } from '../../types';

describe('useSearch - Easy Level', () => {
  let mockEvents: Event[];

  beforeEach(() => {
    mockEvents = [
      {
        id: 'event-1',
        title: '일일 스크럼 회의',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '매일 진행되는 스크럼 회의입니다.',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
        notificationTime: 15,
      },
      {
        id: 'event-2',
        title: '주간 프로젝트 리뷰',
        date: '2025-01-20',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 프로젝트 진행상황을 점검합니다.',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 30,
      },
      {
        id: 'event-3',
        title: '월간 전략 회의',
        date: '2025-01-25',
        startTime: '16:00',
        endTime: '17:00',
        description: '월간 전략 수립 및 검토 회의입니다.',
        location: '회의실 C',
        category: '전략',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 60,
      },
      {
        id: 'event-4',
        title: '개인 휴가',
        date: '2025-02-01',
        startTime: '00:00',
        endTime: '23:59',
        description: '연차 휴가입니다.',
        location: '집',
        category: '개인',
        repeat: { type: 'none', interval: 1, endDate: '' },
        notificationTime: 0,
      },
    ];
  });

  describe('기본 상태 초기화', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      expect(result.current.searchTerm).toBe('');
      expect(result.current.searchResults).toEqual(mockEvents);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.searchFilters).toEqual({
        category: 'all',
        dateRange: { start: null, end: null },
        repeatType: 'all',
        location: 'all',
      });
    });

    it('should initialize with empty events array', () => {
      const { result } = renderHook(() => useSearch([]));

      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('검색어 관리', () => {
    it('should update search term', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearchTerm('회의');
      });

      expect(result.current.searchTerm).toBe('회의');
    });

    it('should clear search term', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      // 먼저 검색어 설정
      act(() => {
        result.current.setSearchTerm('회의');
      });
      expect(result.current.searchTerm).toBe('회의');

      // 검색어 클리어
      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.searchResults).toEqual(mockEvents);
    });

    it('should update search term with empty string', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearchTerm('');
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.searchResults).toEqual(mockEvents);
    });
  });

  describe('기본 검색 기능', () => {
    it('should find events by title', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearchTerm('스크럼');
      });

      const expectedResults = mockEvents.filter((event) => event.title.includes('스크럼'));
      expect(result.current.searchResults).toEqual(expectedResults);
    });

    it('should find events by description', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearchTerm('진행상황');
      });

      const expectedResults = mockEvents.filter((event) => event.description.includes('진행상황'));
      expect(result.current.searchResults).toEqual(expectedResults);
    });

    it('should find events by location', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearchTerm('회의실 A');
      });

      const expectedResults = mockEvents.filter((event) => event.location.includes('회의실 A'));
      expect(result.current.searchResults).toEqual(expectedResults);
    });

    it('should find events by category', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearchTerm('업무');
      });

      const expectedResults = mockEvents.filter((event) => event.category.includes('업무'));
      expect(result.current.searchResults).toEqual(expectedResults);
    });

    it('should perform case-insensitive search', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearchTerm('회의');
      });

      // 실제로는 3개가 "회의"를 포함 (event-1: 제목, event-2: 위치, event-3: 제목)
      const expectedResults = mockEvents.filter(
        (event) =>
          event.title.toLowerCase().includes('회의') ||
          event.description.toLowerCase().includes('회의') ||
          event.location.toLowerCase().includes('회의') ||
          event.category.toLowerCase().includes('회의')
      );
      expect(result.current.searchResults).toEqual(expectedResults);
      expect(result.current.searchResults).toHaveLength(3);
    });

    it('should return empty results for non-matching search', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearchTerm('존재하지 않는 일정');
      });

      expect(result.current.searchResults).toEqual([]);
    });
  });

  describe('검색 필터 기본 동작', () => {
    it('should update category filter', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setCategoryFilter('업무');
      });

      expect(result.current.searchFilters.category).toBe('업무');
    });

    it('should update repeat type filter', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setRepeatTypeFilter('daily');
      });

      expect(result.current.searchFilters.repeatType).toBe('daily');
    });

    it('should update location filter', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setLocationFilter('회의실 A');
      });

      expect(result.current.searchFilters.location).toBe('회의실 A');
    });

    it('should reset all filters', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      // 먼저 필터 설정
      act(() => {
        result.current.setCategoryFilter('업무');
        result.current.setRepeatTypeFilter('daily');
        result.current.setLocationFilter('회의실 A');
      });

      // 필터 리셋
      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.searchFilters.category).toBe('all');
      expect(result.current.searchFilters.repeatType).toBe('all');
      expect(result.current.searchFilters.location).toBe('all');
      expect(result.current.searchFilters.dateRange.start).toBeNull();
      expect(result.current.searchFilters.dateRange.end).toBeNull();
    });
  });

  describe('검색 상태 관리', () => {
    it('should set searching state to true', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearching(true);
      });

      expect(result.current.isSearching).toBe(true);
    });

    it('should set searching state to false', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      // 먼저 검색 상태로 설정
      act(() => {
        result.current.setSearching(true);
      });
      expect(result.current.isSearching).toBe(true);

      // 검색 상태 해제
      act(() => {
        result.current.setSearching(false);
      });
      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('검색 결과 정렬', () => {
    it('should sort results by date ascending', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.sortByDate('asc');
      });

      const sortedEvents = [...mockEvents].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      expect(result.current.searchResults).toEqual(sortedEvents);
    });

    it('should sort results by date descending', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.sortByDate('desc');
      });

      const sortedEvents = [...mockEvents].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      expect(result.current.searchResults).toEqual(sortedEvents);
    });

    it('should sort results by title alphabetically', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.sortByTitle('asc');
      });

      const sortedEvents = [...mockEvents].sort((a, b) => a.title.localeCompare(b.title));
      expect(result.current.searchResults).toEqual(sortedEvents);
    });

    it('should sort results by title reverse alphabetically', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.sortByTitle('desc');
      });

      const sortedEvents = [...mockEvents].sort((a, b) => b.title.localeCompare(a.title));
      expect(result.current.searchResults).toEqual(sortedEvents);
    });
  });

  describe('검색 히스토리', () => {
    it('should add search term to history', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearchTerm('회의');
      });

      expect(result.current.searchHistory).toContain('회의');
    });

    it('should not add duplicate search terms to history', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearchTerm('회의');
      });

      act(() => {
        result.current.setSearchTerm('회의');
      });

      const historyCount = result.current.searchHistory.filter((term) => term === '회의').length;
      expect(historyCount).toBe(1);
    });

    it('should clear search history', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      // 먼저 검색어 추가
      act(() => {
        result.current.setSearchTerm('회의');
        result.current.setSearchTerm('스크럼');
      });

      expect(result.current.searchHistory.length).toBeGreaterThan(0);

      // 히스토리 클리어
      act(() => {
        result.current.clearSearchHistory();
      });

      expect(result.current.searchHistory).toEqual([]);
    });
  });

  describe('검색 통계', () => {
    it('should return correct search result count', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearchTerm('회의');
      });

      // 실제로는 3개가 "회의"를 포함 (event-1: 제목, event-2: 위치, event-3: 제목)
      expect(result.current.searchResultCount).toBe(3);
    });

    it('should return zero count for no results', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      act(() => {
        result.current.setSearchTerm('존재하지 않는 일정');
      });

      expect(result.current.searchResultCount).toBe(0);
    });

    it('should return total count when no search term', () => {
      const { result } = renderHook(() => useSearch(mockEvents));

      expect(result.current.searchResultCount).toBe(mockEvents.length);
    });
  });
});
