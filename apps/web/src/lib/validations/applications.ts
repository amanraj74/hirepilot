import { z } from 'zod';

export const moveStageSchema = z.object({
  stage: z.enum([
    'APPLIED',
    'RESUME_SCREENING',
    'SHORTLISTED',
    'TECHNICAL_INTERVIEW',
    'HR_INTERVIEW',
    'OFFER',
    'HIRED',
    'REJECTED',
  ]),
});

export type MoveStageInput = z.infer<typeof moveStageSchema>;

export const applySchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z
    .string()
    .min(40, 'Cover letter must be at least 40 characters')
    .max(5_000, 'Cover letter is too long (max 5,000 characters)'),
});

export type ApplyInput = z.infer<typeof applySchema>;
