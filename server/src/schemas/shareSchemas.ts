import { z } from 'zod';

export const createShareSchema = z.object({
  expiresInDays: z
    .number()
    .int('Expiration days must be an integer')
    .min(1, 'Expiration must be at least 1 day')
    .max(365, 'Expiration cannot exceed 365 days')
    .nullable()
    .optional(),
  label: z
    .string()
    .trim()
    .max(60, 'Label cannot exceed 60 characters')
    .optional()
    .default('Shared Career Roadmap'),
});

export const shareTokenParamSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{64}$/, 'Invalid share token format. Expected 64-character hexadecimal token.'),
});

export type CreateShareInput = z.infer<typeof createShareSchema>;
