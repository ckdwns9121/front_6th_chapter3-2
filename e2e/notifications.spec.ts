import { test, expect } from '@playwright/test';

test('E2E-01: 알림 표시 – 일정 시작 10분 전 알림 토스트가 나타난다', async ({ page }) => {
  await page.route('**/api/events', async (route) => {
    const now = Date.now();
    // 현재 시간 기준 9분뒤를 이벤트 시작시간으로 설정
    const startDateObj = new Date(now + 9 * 60 * 1000);
    // 이벤트 시작시간 기준 30분뒤를 이벤트 종료시간으로 설정
    const endDateObj = new Date(startDateObj.getTime() + (9 + 30) * 60 * 1000);

    const dateString = startDateObj.toISOString().split('T')[0];
    const startTimeString = startDateObj.toTimeString().slice(0, 5);
    const endTimeString = endDateObj.toTimeString().slice(0, 5);

    const mockEventsResponse = {
      events: [
        {
          id: 'test-event-1',
          title: '테스트 일정',
          date: dateString,
          startTime: startTimeString,
          endTime: endTimeString,
          description: 'E2E 알림 테스트',
          location: 'online',
          category: '업무',
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
  });

  await page.goto('/');

  const alert = page.getByRole('alert').filter({ hasText: /10분 후 .* 일정이 시작됩니다\./ });

  // 1) 토스트가 나타난다
  await expect(alert).toBeVisible({ timeout: 20000 });

  // 2) 이벤트 리스트에 빨간색 알림 아이콘이 표시된다 (MuiSvgIcon-colorError)
  const errorIconInList = page
    .locator('[data-testid="event-list"]')
    .locator('svg.MuiSvgIcon-colorError');
  await expect(errorIconInList).toHaveCount(1);

  // 3) 닫기 버튼을 누르면 토스트가 사라진다
  await alert.locator('button').first().click();
  await expect(alert).toHaveCount(0);
});
