import { test, expect } from '@playwright/test';

test('E2E-03: 캘린더 뷰 렌더링 – 주간/월간 뷰 전환 → 날짜 표시 확인', async ({ page }) => {
  // 현재 날짜를 기준으로 동적 날짜 생성 (현재 주의 날짜들)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');

  // 현재 주의 월요일과 목요일 날짜 계산
  const currentDay = today.getDay(); // 0=일요일, 1=월요일, ...
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // 월요일까지의 offset

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);

  const testDate1 = `${currentYear}-${currentMonth}-${String(monday.getDate()).padStart(2, '0')}`;
  const testDate2 = `${currentYear}-${currentMonth}-${String(thursday.getDate()).padStart(2, '0')}`;

  // 캘린더 뷰 렌더링 테스트를 위한 Mock 데이터 설정
  await page.route('**/api/events', async (route) => {
    if (route.request().method() === 'GET') {
      const mockEventsResponse = {
        events: [
          {
            id: 'view-test-event-1',
            title: '팀 회의',
            date: testDate1,
            startTime: '10:00',
            endTime: '11:00',
            description: '캘린더 뷰 테스트용 회의',
            location: '회의실 A',
            category: '업무',
            repeat: { type: 'none', interval: 1 },
            notificationTime: 10,
          },
          {
            id: 'view-test-event-2',
            title: '개인 약속',
            date: testDate2,
            startTime: '15:00',
            endTime: '16:00',
            description: '캘린더 뷰 테스트용 약속',
            location: '카페',
            category: '개인',
            repeat: { type: 'none', interval: 1 },
            notificationTime: 10,
          },
        ],
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEventsResponse),
      });
    }
  });

  await page.goto('/');

  // 기본적으로 월간 뷰가 표시되는지 확인
  const monthView = page.getByTestId('month-view');
  await expect(monthView).toBeVisible();

  // 1) 월간 뷰에서 날짜와 일정 표시 확인 (일정이 로딩될 때까지 기다림)
  await expect(monthView.getByText('팀 회의')).toBeVisible();
  await expect(monthView.getByText('개인 약속')).toBeVisible();

  // 월간 뷰 제목 확인 (예: "2025년 8월")
  const monthTitle = page
    .locator('h5')
    .filter({ hasText: new RegExp(`${currentYear}년 ${parseInt(currentMonth)}월`) });
  await expect(monthTitle).toBeVisible();

  // 2) 주간 뷰로 전환
  await page.click('[aria-label="뷰 타입 선택"]');
  await page.click('[aria-label="week-option"]');

  // 주간 뷰가 표시되는지 확인
  const weekView = page.getByTestId('week-view');
  await expect(weekView).toBeVisible();
  await expect(monthView).not.toBeVisible();

  // 주간 뷰에서도 동일한 일정들이 표시되는지 확인
  await expect(weekView.getByText('팀 회의')).toBeVisible();
  await expect(weekView.getByText('개인 약속')).toBeVisible();

  // 주간 뷰 제목 확인 (날짜 범위 표시)
  const weekTitle = page.locator('h5').filter({ hasText: new RegExp(`${currentYear}`) });
  await expect(weekTitle).toBeVisible();

  // 3) 다시 월간 뷰로 전환
  await page.click('[aria-label="뷰 타입 선택"]');
  await page.click('[aria-label="month-option"]');

  // 월간 뷰가 다시 표시되는지 확인
  await expect(monthView).toBeVisible();
  await expect(weekView).not.toBeVisible();

  // 월간 뷰에서 여전히 일정들이 올바르게 표시되는지 확인
  await expect(monthView.getByText('팀 회의')).toBeVisible();
  await expect(monthView.getByText('개인 약속')).toBeVisible();

  // 4) 네비게이션 테스트 (다음 달로 이동)
  const nextButton = page.getByRole('button', { name: 'Next' });
  await nextButton.click();

  // 다음 달로 이동했을 때 일정이 없어야 함 (현재 달에만 일정이 있음)
  const nextMonthView = page.getByTestId('month-view');
  await expect(nextMonthView.getByText('팀 회의')).not.toBeVisible();
  await expect(nextMonthView.getByText('개인 약속')).not.toBeVisible();

  // 5) 이전 달로 돌아가기
  const prevButton = page.getByRole('button', { name: 'Previous' });
  await prevButton.click();

  // 원래 달로 돌아왔을 때 일정들이 다시 표시되는지 확인
  await expect(monthView.getByText('팀 회의')).toBeVisible();
  await expect(monthView.getByText('개인 약속')).toBeVisible();

  // 6) 이벤트 리스트에서도 동일한 일정들이 표시되는지 확인
  const eventList = page.getByTestId('event-list');
  await expect(eventList.getByText('팀 회의')).toBeVisible();
  await expect(eventList.getByText('개인 약속')).toBeVisible();
});
