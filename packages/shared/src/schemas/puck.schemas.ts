import { z } from 'zod';

export const pairPuckSchema = z.object({
  name: z.string().min(1).max(100),
  securityCode: z.string().regex(/^\d{6}$/, 'Must be exactly 6 digits'),
});

export const updatePuckSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const updatePuckSettingsSchema = z.object({
  securityCode: z
    .string()
    .regex(/^\d{6}$/, 'Must be exactly 6 digits')
    .optional(),
});

export type PairPuckInput = z.infer<typeof pairPuckSchema>;
export type UpdatePuckInput = z.infer<typeof updatePuckSchema>;
export type UpdatePuckSettingsInput = z.infer<typeof updatePuckSettingsSchema>;
