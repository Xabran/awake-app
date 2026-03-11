import { z } from 'zod';

export const createAlarmSchema = z.object({
  puckId: z.string().uuid(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:mm format'),
  recurringDays: z.array(z.number().int().min(0).max(6)).default([]),
  snoozeEnabled: z.boolean().default(true),
  snoozeDurationMin: z.number().int().min(1).max(30).default(5),
  label: z.string().max(100).default(''),
  ringtoneId: z.string().nullable().default(null),
  isEnabled: z.boolean().default(true),
});

export const updateAlarmSchema = createAlarmSchema
  .omit({ puckId: true })
  .partial();

export type CreateAlarmInput = z.infer<typeof createAlarmSchema>;
export type UpdateAlarmInput = z.infer<typeof updateAlarmSchema>;
