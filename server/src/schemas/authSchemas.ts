import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .max(100, 'Email must not exceed 100 characters')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(60, 'Name must not exceed 60 characters')
    .trim(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateProgressSchema = z.object({
  milestoneId: z.string().min(1, 'Milestone ID is required'),
  isKnown: z.boolean(),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
