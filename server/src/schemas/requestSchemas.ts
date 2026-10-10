import { z } from 'zod';

export const generateRoadmapRequestSchema = z.object({
  targetRole: z
    .string({ required_error: 'Target role is required' })
    .trim()
    .min(3, 'Target role must be at least 3 characters')
    .max(100, 'Target role must not exceed 100 characters'),
  targetCompanyType: z
    .string()
    .trim()
    .max(80, 'Target company type must not exceed 80 characters')
    .optional()
    .default('Innovative Tech Company'),
  experienceLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'], {
      errorMap: () => ({ message: "Experience level must be 'Beginner', 'Intermediate', or 'Advanced'" }),
    })
    .default('Beginner'),
  weeklyCommitmentHours: z
    .number({ invalid_type_error: 'Weekly commitment hours must be a number' })
    .int('Weekly commitment hours must be an integer')
    .min(5, 'Minimum weekly commitment is 5 hours')
    .max(60, 'Maximum weekly commitment is 60 hours')
    .default(15),
  knownSkillIds: z.array(z.string().trim()).optional().default([]),
});

export type GenerateRoadmapInput = z.infer<typeof generateRoadmapRequestSchema>;
