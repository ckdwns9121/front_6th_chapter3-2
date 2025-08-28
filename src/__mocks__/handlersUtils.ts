import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

const mockRepeatingEvents: Event[] = [
  {
    id: '1',
    title: '주간 가족 회의',
    date: '2025-10-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '매주 진행되는 가족 회의',
    location: '회의실 C',
    category: '가족',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '주간 가족 회의',
    date: '2025-10-22',
    startTime: '10:00',
    endTime: '11:00',
    description: '매주 진행되는 가족 회의',
    location: '회의실 C',
    category: '가족',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '주간 가족 회의',
    date: '2025-10-29',
    startTime: '10:00',
    endTime: '11:00',
    description: '매주 진행되는 가족 회의',
    location: '회의실 C',
    category: '가족',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-10-30' },
    notificationTime: 10,
  },
];

// ! Hard 여기 제공 안함
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1); // 간단한 ID 생성
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};

// 전역 변수로 mockEvents 관리
let globalMockEvents: Event[] = [];

export const setupMockHandlerRepeatCreation = () => {
  // 기존 데이터 초기화
  globalMockEvents = [];

  // 기존 핸들러 정리 후 새로운 핸들러 등록
  server.resetHandlers();

  server.use(
    // GET /api/events - 이벤트 목록 조회
    http.get('/api/events', () => {
      console.log('GET /api/events - 현재 globalMockEvents:', globalMockEvents);
      return HttpResponse.json({ events: [...globalMockEvents] });
    }),

    // POST /api/events-list - 반복 일정 생성
    http.post('/api/events-list', async ({ request }) => {
      try {
        const { events: newEvents } = (await request.json()) as { events: Event[] };
        console.log('POST /api/events-list - newEvents:', newEvents);

        // ID 할당
        let id = globalMockEvents.length + 1;
        newEvents.forEach((event) => {
          event.id = String(id++);
        });

        // globalMockEvents 배열에 새 이벤트들 추가
        globalMockEvents.push(...newEvents);
        console.log('POST /api/events-list - 업데이트된 globalMockEvents:', globalMockEvents);

        return HttpResponse.json(newEvents, { status: 201 });
      } catch (error) {
        console.error('POST /api/events-list 에러:', error);
        return new HttpResponse(null, { status: 500 });
      }
    }),

    // PUT /api/events/:id - 이벤트 수정
    http.put('/api/events/:id', async ({ params, request }) => {
      try {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        console.log('PUT /api/events/:id - 수정 요청:', { id, updatedEvent });

        const index = globalMockEvents.findIndex((event) => event.id === id);

        if (index !== -1) {
          // 반복 일정 수정 시: 단일 일정으로 변경
          if (updatedEvent.repeat.type === 'none') {
            globalMockEvents[index] = {
              ...globalMockEvents[index],
              ...updatedEvent,
              isRecurring: false,
              recurringSeriesId: undefined,
            };
          } else {
            // 일반 일정 수정
            globalMockEvents[index] = {
              ...globalMockEvents[index],
              ...updatedEvent,
            };
          }
          console.log('PUT /api/events/:id - 업데이트된 이벤트:', globalMockEvents[index]);
          return HttpResponse.json(globalMockEvents[index]);
        } else {
          return new HttpResponse(null, { status: 404 });
        }
      } catch (error) {
        console.error('PUT /api/events/:id 에러:', error);
        return new HttpResponse(null, { status: 500 });
      }
    }),

    // DELETE /api/events-list - 이벤트 삭제 (여러 개 한 번에)
    http.delete('/api/events-list', async ({ request }) => {
      try {
        const { eventIds } = (await request.json()) as { eventIds: string[] };
        console.log('DELETE /api/events-list - 삭제 요청:', { eventIds });

        // globalMockEvents에서 해당 ID들을 가진 이벤트들 제거
        const initialLength = globalMockEvents.length;
        globalMockEvents = globalMockEvents.filter((event) => !eventIds.includes(event.id));
        const deletedCount = initialLength - globalMockEvents.length;

        console.log('DELETE /api/events-list - 삭제된 이벤트 수:', deletedCount);
        console.log('DELETE /api/events-list - 업데이트된 globalMockEvents:', globalMockEvents);

        return new HttpResponse(null, { status: 204 });
      } catch (error) {
        console.error('DELETE /api/events-list 에러:', error);
        return new HttpResponse(null, { status: 500 });
      }
    })
  );

  console.log('setupMockHandlerRepeatCreation 완료 - 핸들러 등록됨');
};
export const setupMockHandlerUpdating = ({ isRepeat = false } = {}) => {
  const mockEvents: Event[] = isRepeat
    ? [...mockRepeatingEvents]
    : [
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
        {
          id: '2',
          title: '기존 회의2',
          date: '2025-10-15',
          startTime: '11:00',
          endTime: '12:00',
          description: '기존 팀 미팅 2',
          location: '회의실 C',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
      return HttpResponse.json(mockEvents[index]);
    })
  );
};

export const setupMockHandlerDeletion = ({ isRepeat = false } = {}) => {
  const mockEvents: Event[] = isRepeat
    ? [...mockRepeatingEvents]
    : [
        {
          id: '1',
          title: '삭제할 이벤트',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '삭제할 이벤트입니다',
          location: '어딘가',
          category: '기타',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
};
