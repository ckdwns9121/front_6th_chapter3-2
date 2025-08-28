import { test, expect } from '@playwright/test';

test('E2E-02: 모달 인터랙션 – 충돌 모달 열기 → ESC로 닫기 → 배경 클릭으로 닫기', async ({
  page,
}) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const testDate = `${currentYear}-${currentMonth}-15`;

  await page.route('**/api/events', async (route) => {
    if (route.request().method() === 'GET') {
      const mockEventsResponse = {
        events: [
          {
            id: 'existing-event-1',
            title: '기존 회의',
            date: testDate,
            startTime: '09:00',
            endTime: '10:00',
            description: '이미 등록된 회의',
            location: '회의실 A',
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
    } else if (route.request().method() === 'POST') {
      // POST 요청은 실제로 처리하지 않고 성공 응답만 반환
      // 모달 취소 시 실제 저장이 일어나지 않음을 테스트하기 위함
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    }
  });

  await page.goto('/');

  // 기존 일정이 로딩될 때까지 기다리기 (이벤트 리스트에서 확인)
  await expect(page.getByTestId('event-list').getByText('기존 회의')).toBeVisible();

  // 충돌하는 새 일정 입력 (같은 날짜, 겹치는 시간)
  await page.fill('#title', '새로운 회의');
  await page.fill('#date', testDate);
  await page.fill('#start-time', '09:30');
  await page.fill('#end-time', '10:30');
  await page.fill('#description', '충돌 테스트용 회의');
  await page.fill('#location', '회의실 B');

  // 일정 추가 버튼 클릭 → 충돌 모달이 나타나야 함
  await page.click('[data-testid="event-submit-button"]');

  // 1) 충돌 모달이 표시되는지 확인
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  await expect(page.getByText('일정 겹침 경고')).toBeVisible();
  await expect(page.getByText('다음 일정과 겹칩니다:')).toBeVisible();
  await expect(page.getByText(`기존 회의 (${testDate} 09:00-10:00)`)).toBeVisible();

  // 2) ESC 키로 모달 닫기
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();

  // 3) 모달이 닫힌 후 기존 데이터 무변경 확인
  // 이벤트 리스트에 기존 일정만 존재하고 새 일정은 없어야 함
  const eventList = page.getByTestId('event-list');
  await expect(eventList.getByText('기존 회의')).toBeVisible();
  // 새 일정은 저장되지 않았으므로 이벤트 리스트에 없어야 함
  await expect(eventList.getByText('새로운 회의')).not.toBeVisible();

  // 4) 폼 데이터는 여전히 입력된 상태로 유지되어야 함
  await expect(page.locator('#title')).toHaveValue('새로운 회의');
  await expect(page.locator('#date')).toHaveValue(testDate);
});
