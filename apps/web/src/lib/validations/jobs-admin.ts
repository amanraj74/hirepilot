// Zod schemas for recruiter-scoped job mutations.
// Mirrors the public list query schema but adds create / update variants.

import { z } from 'zod';

const workModeValues = ['REMOTE', 'HYBRID', 'ONSITE'] as const;
const employmentTypeValues = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] as const;
const experienceLevelValues = ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'] as const;
const statusValues = ['DRAFT', 'OPEN', 'PAUSED', 'CLOSED', 'FILLED'] as const;

// All base fields declared explicitly so zod preserves full type info on parsed.data.
const baseFieldDefs = {
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  department: z.string().max(80).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  workMode: z.enum(workModeValues),
  employmentType: z.enum(employmentTypeValues),
  experienceLevel: z.enum(experienceLevelValues),
  experienceYears: z.coerce.number().int().min(0).max(20).optional().nullable(),
  salaryMin: z.coerce.number().int().positive().max(10_000_000).optional().nullable(),
  salaryMax: z.coerce.number().int().positive().max(10_000_000).optional().nullable(),
  salaryCurrency: z.string().length(3).toUpperCase().default('USD'),
  skillsRequired: z
    .array(z.string().min(1).max(60))
    .min(1, 'At least one skill is required')
    .max(15, 'Max 15 skills'),
  description: z.string().min(40, 'Description must be at least 40 characters').max(20_000),
  requirements: z.string().max(10_000).optional().nullable(),
  benefits: z.string().max(5_000).optional().nullable(),
  deadline: z.coerce.date().optional().nullable(),
};

export const createJobSchema = z.object({
  ...baseFieldDefs,
  status: z.enum(statusValues).optional(),
  publish: z.coerce.boolean().optional(),
});

export type CreateJobInputSchema = z.infer<typeof createJobSchema>;

// Update schema: every field optional. Defined explicitly so zod preserves
// the full union (the spread-with-optional trick loses field types).
export const updateJobSchema = z.object({
  title: baseFieldDefs.title.optional(),
  department: baseFieldDefs.department,
  location: baseFieldDefs.location,
  workMode: baseFieldDefs.workMode.optional(),
  employmentType: baseFieldDefs.employmentType.optional(),
  experienceLevel: baseFieldDefs.experienceLevel.optional(),
  experienceYears: baseFieldDefs.experienceYears,
  salaryMin: baseFieldDefs.salaryMin,
  salaryMax: baseFieldDefs.salaryMax,
  salaryCurrency: baseFieldDefs.salaryCurrency,
  skillsRequired: baseFieldDefs.skillsRequired.optional(),
  description: baseFieldDefs.description.optional(),
  requirements: baseFieldDefs.requirements,
  benefits: baseFieldDefs.benefits,
  deadline: baseFieldDefs.deadline,
  status: z.enum(statusValues).optional(),
});

export type UpdateJobInputSchema = z.infer<typeof updateJobSchema>;
