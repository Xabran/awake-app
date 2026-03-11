export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sun=0 ... Sat=6

export interface Alarm {
  id: string;
  puckId: string;
  time: string; // HH:mm format
  recurringDays: DayOfWeek[];
  snoozeEnabled: boolean;
  snoozeDurationMin: number;
  label: string;
  ringtoneId: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
