// Zod schemas for the public jobs API.
// Mirrors the query-string contract of GET /api/jobs.

import { z } from 'zod';

const workModeValues = ['REMOTE', 'HYBRID', 'ONSITE'] as const;
const employmentTypeValues = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] as const;
const experienceLevelValues = ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'] as const;

export const jobListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  location: z.string().trim().max(80).optional(),
  workMode: z.enum(workModeValues).optional(),
  employmentType: z.enum(employmentTypeValues).optional(),
  experienceLevel: z.enum(experienceLevelValues).optional(),
  minSalary: z.coerce.number().int().positive().max(1_000_000).optional(),
  page: z.coerce.number().int().positive().max(100).default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type JobListQuery = z.infer<typeof jobListQuerySchema>;

export const jobIdParamSchema = z.object({
  id: z.string().min(1).max(40),
});

export type JobIdParam = z.infer<typeof jobIdParamSchema>;
