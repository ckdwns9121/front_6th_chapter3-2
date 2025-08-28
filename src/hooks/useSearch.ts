import { useMemo, useState, useCallback, useEffect } from 'react';

import { Event } from '../types';

// 검색 필터 타입 정의
interface SearchFilters {
  category: string;
  dateRange: { start: Date | null; end: Date | null };
  repeatType: string;
  location: string;
}

// 정렬 방향 타입
type SortDirection = 'asc' | 'desc';

export const useSearch = (events: Event[]) => {
  // 기본 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 검색 필터 상태
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    category: 'all',
    dateRange: { start: null, end: null },
    repeatType: 'all',
    location: 'all',
  });

  // 검색 히스토리 상태
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 검색 결과 상태 (초기값은 모든 이벤트)
  const [searchResults, setSearchResults] = useState<Event[]>(events);

  // 검색어 설정 함수
  const handleSetSearchTerm = useCallback(
    (term: string) => {
      setSearchTerm(term);

      // 검색어가 있고 중복되지 않으면 히스토리에 추가
      if (term && !searchHistory.includes(term)) {
        setSearchHistory((prev) => [...prev, term]);
      }
    },
    [searchHistory]
  );

  // 검색어 클리어 함수
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults(events);
  }, [events]);

  // 검색 상태 설정 함수
  const setSearching = useCallback((searching: boolean) => {
    setIsSearching(searching);
  }, []);

  // 카테고리 필터 설정 함수
  const setCategoryFilter = useCallback((category: string) => {
    setSearchFilters((prev) => ({ ...prev, category }));
  }, []);

  // 반복 유형 필터 설정 함수
  const setRepeatTypeFilter = useCallback((repeatType: string) => {
    setSearchFilters((prev) => ({ ...prev, repeatType }));
  }, []);

  // 위치 필터 설정 함수
  const setLocationFilter = useCallback((location: string) => {
    setSearchFilters((prev) => ({ ...prev, location }));
  }, []);

  // 모든 필터 리셋 함수
  const resetFilters = useCallback(() => {
    setSearchFilters({
      category: 'all',
      dateRange: { start: null, end: null },
      repeatType: 'all',
      location: 'all',
    });
  }, []);

  // 날짜별 정렬 함수
  const sortByDate = useCallback(
    (direction: SortDirection) => {
      const sorted = [...searchResults].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      });
      setSearchResults(sorted);
    },
    [searchResults]
  );

  // 제목별 정렬 함수
  const sortByTitle = useCallback(
    (direction: SortDirection) => {
      const sorted = [...searchResults].sort((a, b) => {
        const comparison = a.title.localeCompare(b.title);
        return direction === 'asc' ? comparison : -comparison;
      });
      setSearchResults(sorted);
    },
    [searchResults]
  );

  // 검색 히스토리 클리어 함수
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // 필터링된 이벤트 계산
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // 검색어로 필터링
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((event) => {
        const titleMatch = event.title.toLowerCase().includes(lowerTerm);
        const descriptionMatch = event.description.toLowerCase().includes(lowerTerm);
        const locationMatch = event.location.toLowerCase().includes(lowerTerm);
        const categoryMatch = event.category.toLowerCase().includes(lowerTerm);

        return titleMatch || descriptionMatch || locationMatch || categoryMatch;
      });
    }

    // 카테고리 필터
    if (searchFilters.category !== 'all') {
      filtered = filtered.filter((event) => event.category === searchFilters.category);
    }

    // 반복 유형 필터
    if (searchFilters.repeatType !== 'all') {
      filtered = filtered.filter((event) => event.repeat.type === searchFilters.repeatType);
    }

    // 위치 필터
    if (searchFilters.location !== 'all') {
      filtered = filtered.filter((event) => event.location === searchFilters.location);
    }

    // 날짜 범위 필터
    if (searchFilters.dateRange.start) {
      filtered = filtered.filter((event) => new Date(event.date) >= searchFilters.dateRange.start!);
    }
    if (searchFilters.dateRange.end) {
      filtered = filtered.filter((event) => new Date(event.date) <= searchFilters.dateRange.end!);
    }

    return filtered;
  }, [events, searchTerm, searchFilters]);

  // 검색 결과 업데이트 (useEffect로 변경하여 무한 루프 방지)
  useEffect(() => {
    setSearchResults(filteredEvents);
  }, [filteredEvents]);

  // 검색 결과 개수
  const searchResultCount = searchResults.length;

  return {
    // 기본 상태
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    searchResults,
    isSearching,
    searchFilters,

    // 필터링된 이벤트 (기존 호환성)
    filteredEvents,

    // 검색 관련 함수들
    clearSearch,
    setSearching,

    // 필터 관련 함수들
    setCategoryFilter,
    setRepeatTypeFilter,
    setLocationFilter,
    resetFilters,

    // 정렬 함수들
    sortByDate,
    sortByTitle,

    // 검색 히스토리
    searchHistory,
    clearSearchHistory,

    // 검색 통계
    searchResultCount,
  };
};
