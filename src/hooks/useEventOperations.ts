import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRepeatDates } from '../utils/recurringEvents';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };

  const createRecurringEvents = (eventData: EventForm): Event[] => {
    if (eventData.repeat.type === 'none') {
      // 반복이 아닌 경우 단일 이벤트 생성
      const newEvent: Event = {
        id: crypto.randomUUID(),
        title: eventData.title,
        date: eventData.date,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        description: eventData.description,
        location: eventData.location,
        category: eventData.category,
        repeat: eventData.repeat,
        notificationTime: eventData.notificationTime,
        isRecurring: false,
        recurringSeriesId: '',
      };
      return [newEvent];
    }

    // 반복 일정인 경우
    const recurringSeriesId = crypto.randomUUID();
    const repeatDates = generateRepeatDates(
      eventData.date,
      eventData.repeat.type,
      eventData.repeat.interval || 1,
      eventData.repeat.endDate || '2025-10-30' // 최대 종료일
    );

    return repeatDates.map((date) => ({
      id: crypto.randomUUID(),
      title: eventData.title,
      date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      description: eventData.description,
      location: eventData.location,
      category: eventData.category,
      repeat: eventData.repeat,
      notificationTime: eventData.notificationTime,
      isRecurring: true,
      recurringSeriesId,
    }));
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      if (editing) {
        // 수정 모드: 기존 이벤트 업데이트
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        // 생성 모드: 반복 일정 처리
        if ('repeat' in eventData && eventData.repeat.type !== 'none') {
          // 반복 일정 생성
          const recurringEvents = createRecurringEvents(eventData);

          // 반복 일정을 한 번에 저장
          const response = await fetch('/api/events-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: recurringEvents }),
          });

          if (!response.ok) {
            throw new Error('Failed to save recurring events');
          }

          // 로컬 상태 업데이트 후 fetchEvents 호출
          await fetchEvents();
          onSave?.();
          enqueueSnackbar('반복 일정이 추가되었습니다.', { variant: 'success' });
          return;
        } else {
          // 일반 일정 생성
          response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        }
      }

      if (!response?.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      // 삭제할 이벤트를 먼저 찾기
      const eventToDelete = events.find((event) => event.id === id);

      if (!eventToDelete) {
        throw new Error('Event not found');
      }

      // 반복 일정인지 확인
      const isRecurringEvent = eventToDelete.isRecurring && eventToDelete.recurringSeriesId;

      if (isRecurringEvent) {
        // 반복 일정인 경우: 해당 일정만 삭제 (단일 삭제)
        const response = await fetch('/api/events-list', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventIds: [id], // 배열로 ID 전달
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete event');
        }

        // 로컬 상태에서 해당 일정만 제거
        setEvents((prev) => prev.filter((event) => event.id !== id));

        enqueueSnackbar('반복 일정이 삭제되었습니다.', { variant: 'info' });
      } else {
        // 일반 일정인 경우: 기존 로직 사용
        const response = await fetch('/api/events-list', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventIds: [id], // 배열로 ID 전달
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete event');
        }

        await fetchEvents();
        enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
