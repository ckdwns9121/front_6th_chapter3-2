import { ChangeEvent, useState, useCallback } from 'react';

import { Event, RepeatType } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';
import { generateRecurringEvents } from '../utils/recurringEvents';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventForm = (initialEvent?: Event) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || '');
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [category, setCategory] = useState(initialEvent?.category || '업무');
  const [isRepeating, setIsRepeating] = useState(
    initialEvent ? initialEvent.repeat.type !== 'none' : false
  );
  const [repeatType, setRepeatTypeState] = useState<RepeatType>(
    initialEvent?.repeat.type || 'none'
  );
  const [repeatInterval, setRepeatInterval] = useState(initialEvent?.repeat.interval || 1);
  const [repeatEndDate, setRepeatEndDate] = useState(initialEvent?.repeat.endDate || '');
  const [notificationTime, setNotificationTime] = useState(initialEvent?.notificationTime || 10);

  const [editingEvent, setEditingEvent] = useState<Event | null>(initialEvent || null);
  const [generatedEvents, setGeneratedEvents] = useState<Event[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setTimeError(getTimeErrorMessage(newStartTime, endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    setTimeError(getTimeErrorMessage(startTime, newEndTime));
  };

  const setRepeatType = (type: RepeatType) => {
    setRepeatTypeState(type);
    setIsRepeating(type !== 'none');

    // none으로 변경 시 반복 설정 초기화
    if (type === 'none') {
      setRepeatInterval(1);
      setRepeatEndDate('');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setLocation('');
    setCategory('업무');
    setIsRepeating(false);
    setRepeatType('none');
    setRepeatInterval(1);
    setRepeatEndDate('');
    setNotificationTime(10);
    setEditingEvent(null);
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDate(event.date);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setDescription(event.description);
    setLocation(event.location);
    setCategory(event.category);
    setIsRepeating(event.repeat.type !== 'none');
    setRepeatType(event.repeat.type);
    setRepeatInterval(event.repeat.interval);
    setRepeatEndDate(event.repeat.endDate || '');
    setNotificationTime(event.notificationTime);
  };

  // 반복 일정 생성 함수
  const generateRecurringSeries = useCallback(async () => {
    if (!isRepeating || repeatType === 'none') {
      setGenerationError('반복 설정이 필요합니다.');
      return;
    }

    if (!date || !startTime || !endTime) {
      setGenerationError('날짜와 시간을 설정해주세요.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      // RecurringEventConfig 형식으로 변환
      const config = {
        startDate: date,
        endDate:
          repeatEndDate ||
          (() => {
            // 종료일이 없으면 1년 후로 설정
            const endDate = new Date(date);
            endDate.setFullYear(endDate.getFullYear() + 1);
            return endDate.toISOString().split('T')[0];
          })(),
        repeatType,
        maxOccurrences: 100, // 기본값: 최대 100개
        policies: {
          monthly31Policy: 'skip' as const, // 31일이 없는 달은 건너뛰기
        },
      };

      const recurringEvents = generateRecurringEvents(config);

      // RecurringEvent를 Event 형식으로 변환
      const events: Event[] = recurringEvents.map((recurringEvent, index) => ({
        id: `recurring-${Date.now()}-${index}`,
        title,
        date: recurringEvent.date,
        startTime,
        endTime,
        description,
        location,
        category,
        repeat: {
          type: repeatType,
          interval: repeatInterval,
          endDate: repeatEndDate || '',
        },
        notificationTime,
      }));

      setGeneratedEvents(events);

      // 성공적으로 생성된 경우 에러 초기화
      if (events.length > 0) {
        setGenerationError(null);
      }
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : '반복 일정 생성 중 오류가 발생했습니다.'
      );
      setGeneratedEvents([]);
    } finally {
      setIsGenerating(false);
    }
  }, [
    isRepeating,
    repeatType,
    date,
    startTime,
    endTime,
    title,
    description,
    location,
    category,
    repeatInterval,
    repeatEndDate,
    notificationTime,
  ]);

  // 반복 일정 미리보기
  const previewRecurringSeries = useCallback(() => {
    if (!isRepeating || repeatType === 'none') {
      return [];
    }

    try {
      // RecurringEventConfig 형식으로 변환
      const config = {
        startDate: date,
        endDate:
          repeatEndDate ||
          (() => {
            // 종료일이 없으면 1년 후로 설정
            const endDate = new Date(date);
            endDate.setFullYear(endDate.getFullYear() + 1);
            return endDate.toISOString().split('T')[0];
          })(),
        repeatType,
        maxOccurrences: 10, // 미리보기는 10개까지만
        policies: {
          monthly31Policy: 'skip' as const, // 31일이 없는 달은 건너뛰기
        },
      };

      const recurringEvents = generateRecurringEvents(config);

      // RecurringEvent를 Event 형식으로 변환
      const events: Event[] = recurringEvents.map((recurringEvent, index) => ({
        id: `preview-${Date.now()}-${index}`,
        title,
        date: recurringEvent.date,
        startTime,
        endTime,
        description,
        location,
        category,
        repeat: {
          type: repeatType,
          interval: repeatInterval,
          endDate: repeatEndDate || '',
        },
        notificationTime,
      }));

      return events;
    } catch (error) {
      console.error('Error in previewRecurringSeries:', error);
      return [];
    }
  }, [
    isRepeating,
    repeatType,
    date,
    startTime,
    endTime,
    title,
    description,
    location,
    category,
    repeatInterval,
    repeatEndDate,
    notificationTime,
  ]);

  // 반복 일정 초기화
  const clearGeneratedEvents = useCallback(() => {
    setGeneratedEvents([]);
    setGenerationError(null);
  }, []);

  // 반복 일정 유효성 검사
  const validateRecurringSettings = useCallback(() => {
    const errors: string[] = [];

    if (isRepeating && repeatType === 'none') {
      errors.push('반복 유형을 선택해주세요.');
    }

    if (isRepeating && (!date || !startTime || !endTime)) {
      errors.push('날짜와 시간을 모두 입력해주세요.');
    }

    if (isRepeating && repeatInterval < 1) {
      errors.push('반복 간격은 1 이상이어야 합니다.');
    }

    if (isRepeating && repeatEndDate && new Date(repeatEndDate) <= new Date(date)) {
      errors.push('종료일은 시작일보다 늘어야 합니다.');
    }

    return errors;
  }, [isRepeating, repeatType, date, startTime, endTime, repeatInterval, repeatEndDate]);

  return {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    generatedEvents,
    isGenerating,
    generationError,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
    generateRecurringSeries,
    previewRecurringSeries,
    clearGeneratedEvents,
    validateRecurringSettings,
  };
};
