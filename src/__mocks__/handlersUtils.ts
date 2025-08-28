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
export const setupMockHandlerRepeatCreation = () => {
  const mockEvents: Event[] = [];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events-list', async ({ request }) => {
      const { events: newEvents } = (await request.json()) as { events: Event[] };
      console.log('newEvents:', newEvents);
      let id = mockEvents.length + 1;
      newEvents.forEach((event) => {
        event.id = String(id++);
      });
      mockEvents.push(...newEvents);
      console.log('mockEvents:', mockEvents);
      return HttpResponse.json(mockEvents, { status: 201 });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;

      const updatedEvent = (await request.json()) as Event;

      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents[index] = {
        ...mockEvents[index],
        ...updatedEvent,
        repeat: { type: 'none', interval: 0 },
      };
      return HttpResponse.json(mockEvents[index]);
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
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
