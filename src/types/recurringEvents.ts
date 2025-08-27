export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringEventConfig {
  startDate: string;
  endDate: string;
  repeatType: RepeatType;
  maxOccurrences: number;
}

export interface RecurringEvent {
  id: string;
  date: string;
  isRecurring: boolean;
  recurringSeriesId: string;
}
