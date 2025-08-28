import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerRepeatCreation,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { Event } from '../../types.ts';
import { EventForm } from '../../types.ts';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

describe('useEventOperations', () => {
  describe('기본 기능', () => {
    it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      expect(result.current.events).toEqual([
        {
          id: '1',
          title: '기존 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);
    });

    it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
      setupMockHandlerCreation();

      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      const newEvent: Event = {
        id: '1',
        title: '새 회의',
        date: '2025-10-16',
        startTime: '11:00',
        endTime: '12:00',
        description: '새로운 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(newEvent);
      });

      expect(result.current.events).toEqual([{ ...newEvent, id: '1' }]);
    });

    it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
      setupMockHandlerUpdating();

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const updatedEvent: Event = {
        id: '1',
        date: '2025-10-15',
        startTime: '09:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
        title: '수정된 회의',
        endTime: '11:00',
      };

      await act(async () => {
        await result.current.saveEvent(updatedEvent);
      });

      expect(result.current.events[0]).toEqual(updatedEvent);
    });
  });

  describe('반복 일정 생성', () => {
    it('반복 일정을 생성할 때 generateRepeatDates를 호출하여 여러 날짜의 이벤트를 생성한다', async () => {
      const { result } = renderHook(() => useEventOperations(false));

      const recurringEventData: EventForm = {
        title: '반복 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 회의',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-01-29',
        },
        notificationTime: 60,
      };

      // 반복 일정 저장
      await act(async () => {
        await result.current.saveEvent(recurringEventData);
      });

      // 반복 일정이 여러 개 생성되었는지 확인
      expect(result.current.events.length).toBeGreaterThan(1);

      // 생성된 이벤트들이 모두 같은 제목을 가지고 있는지 확인
      const recurringEvents = result.current.events.filter((event) => event.title === '반복 회의');
      expect(recurringEvents.length).toBeGreaterThan(1);
    });

    it('반복 일정 생성 시 각 이벤트에 고유한 ID와 recurringSeriesId를 부여한다', async () => {
      const { result } = renderHook(() => useEventOperations(false));

      const recurringEventData: EventForm = {
        title: '반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '매일 반복',
        location: '집',
        category: '개인',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-03',
        },
        notificationTime: 60,
      };

      await act(async () => {
        await result.current.saveEvent(recurringEventData);
      });

      const recurringEvents = result.current.events.filter((event) => event.title === '반복 일정');

      // 각 이벤트가 고유한 ID를 가지고 있는지 확인
      const eventIds = recurringEvents.map((event) => event.id);
      const uniqueIds = new Set(eventIds);
      expect(uniqueIds.size).toBe(recurringEvents.length);

      // 모든 이벤트가 같은 recurringSeriesId를 가지고 있는지 확인
      const seriesIds = recurringEvents.map((event) => (event as Event).recurringSeriesId);
      const uniqueSeriesIds = new Set(seriesIds);
      expect(uniqueSeriesIds.size).toBe(1);
    });

    it('반복 일정 수정 시 단일 일정으로 변경한다', async () => {
      setupMockHandlerRepeatCreation(); // 반복 일정 전용 목업 사용

      // 반복 일정 생성 시에는 editing: false
      const { result: createResult } = renderHook(() => useEventOperations(false));

      // 먼저 반복 일정 생성
      const recurringEventData: EventForm = {
        title: '반복 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 회의',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-01-29',
        },
        notificationTime: 60,
      };

      await act(async () => {
        await createResult.current.saveEvent(recurringEventData);
      });

      // 반복 일정 생성 후 fetchEvents를 명시적으로 호출
      await act(async () => {
        await createResult.current.fetchEvents();
      });

      // 첫 번째 반복 일정을 찾기 전에 충분한 시간을 둠
      await act(() => Promise.resolve(null));

      // 첫 번째 반복 일정을 찾기
      const firstEvent = createResult.current.events.find(
        (event) => event.title === '반복 회의' && event.date === '2025-01-01'
      );

      expect(firstEvent).toBeDefined();

      // 수정을 위한 새로운 훅 (editing: true)
      const { result: editResult } = renderHook(() => useEventOperations(true));

      const modifiedEvent: Event = {
        ...firstEvent!,
        title: '수정된 회의',
        description: '이번 주만 변경된 회의',
      };

      await act(async () => {
        await editResult.current.saveEvent(modifiedEvent);
      });

      // 수정 후 fetchEvents 호출
      await act(async () => {
        await editResult.current.fetchEvents();
      });

      // 수정된 이벤트가 단일 일정으로 변경되었는지 확인
      const modifiedEvents = editResult.current.events.filter(
        (event) => event.title === '수정된 회의'
      );
      expect(modifiedEvents.length).toBe(1);

      // 다른 반복 일정들은 그대로 유지되는지 확인
      const originalRecurringEvents = editResult.current.events.filter(
        (event) => event.title === '반복 회의'
      );
      expect(originalRecurringEvents.length).toBeGreaterThan(0);
    });

    it('반복 일정 삭제 시 해당 일정만 삭제한다', async () => {
      setupMockHandlerRepeatCreation(); // 반복 일정 전용 목업 사용

      const { result } = renderHook(() => useEventOperations(false));

      // 먼저 반복 일정 생성
      const recurringEventData: EventForm = {
        title: '반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '매일 반복',
        location: '집',
        category: '개인',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-03',
        },
        notificationTime: 60,
      };

      await act(async () => {
        await result.current.saveEvent(recurringEventData);
      });

      // 상태 동기화를 위해 fetchEvents 명시적 호출
      await act(async () => {
        await result.current.fetchEvents();
      });

      const initialEventCount = result.current.events.length;

      // 첫 번째 반복 일정만 삭제
      const firstEvent = result.current.events.find(
        (event) => event.title === '반복 일정' && event.date === '2025-01-01'
      );

      expect(firstEvent).toBeDefined();

      await act(async () => {
        await result.current.deleteEvent(firstEvent!.id);
      });

      // 삭제 후 상태 동기화
      await act(async () => {
        await result.current.fetchEvents();
      });

      // 전체 이벤트 수가 1개만 줄었는지 확인
      expect(result.current.events.length).toBe(initialEventCount - 1);

      // 삭제된 이벤트가 더 이상 존재하지 않는지 확인
      const deletedEvent = result.current.events.find((event) => event.id === firstEvent!.id);
      expect(deletedEvent).toBeUndefined();

      // 다른 반복 일정들은 그대로 유지되는지 확인
      const remainingRecurringEvents = result.current.events.filter(
        (event) => event.title === '반복 일정'
      );
      expect(remainingRecurringEvents.length).toBeGreaterThan(0);
    });
  });
});
