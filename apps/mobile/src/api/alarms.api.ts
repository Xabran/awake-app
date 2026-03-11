import { apiFetch } from './client';
import type { Alarm, DayOfWeek } from '@awake/shared';

export async function listAlarms(): Promise<Alarm[]> {
  return apiFetch<Alarm[]>('/alarms');
}

export async function getAlarm(id: string): Promise<Alarm> {
  return apiFetch<Alarm>(`/alarms/${id}`);
}

export interface CreateAlarmData {
  puckId: string;
  time: string;
  recurringDays?: DayOfWeek[];
  snoozeEnabled?: boolean;
  snoozeDurationMin?: number;
  label?: string;
  ringtoneId?: string;
  isEnabled?: boolean;
}

export async function createAlarm(data: CreateAlarmData): Promise<Alarm> {
  return apiFetch<Alarm>('/alarms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface UpdateAlarmData {
  time?: string;
  recurringDays?: DayOfWeek[];
  snoozeEnabled?: boolean;
  snoozeDurationMin?: number;
  label?: string;
  ringtoneId?: string;
  isEnabled?: boolean;
}

export async function updateAlarm(id: string, data: UpdateAlarmData): Promise<Alarm> {
  return apiFetch<Alarm>(`/alarms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAlarm(id: string): Promise<void> {
  return apiFetch<void>(`/alarms/${id}`, { method: 'DELETE' });
}
