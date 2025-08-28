export type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type YearlyFeb29Policy = 'clip' | 'leap-only' | 'leap-400-only';
// clip: 평년은 2/28로 '대체'하여 매년 생성
// leap-only: 윤년에만 생성 (TC-201/202용)
// leap-400-only: 400으로 나누어떨어지는 해에만 생성 (TC-203/204용)

export type Monthly31Policy = 'skip' | 'adjust-to-end';
// skip: 31일이 없는 달은 건너뛰기 (기본값)
// adjust-to-end: 31일이 없는 달은 해당 월의 말일로 조정

export interface RecurringEventConfig {
  startDate: string;
  endDate: string;
  repeatType: RepeatType;
  maxOccurrences: number;
  policies?: {
    yearlyFeb29Policy?: YearlyFeb29Policy;
    monthly31Policy?: Monthly31Policy;
  };
}

export interface RecurringEvent {
  id: string;
  date: string;
  title?: string;
  description?: string;
  isRecurring: boolean;
  recurringSeriesId: string;
  isModified?: boolean;
  modificationDate?: string;
  isDeleted?: boolean;
  deletionDate?: string;
}
