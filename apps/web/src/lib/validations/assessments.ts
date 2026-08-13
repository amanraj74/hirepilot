import { z } from 'zod';

export const assessmentQuestionTypeSchema = z.enum(['MCQ', 'CODE', 'SQL', 'DEBUG']);
export type AssessmentQuestionType = z.infer<typeof assessmentQuestionTypeSchema>;

const questionInputSchema = z.object({
  type: assessmentQuestionTypeSchema,
  prompt: z.string().min(5).max(2000),
  options: z.array(z.string().min(1).max(500)).max(10).optional(), // MCQ options
  solution: z.string().max(2000).optional(), // For SQL/code expected output
  expectedOutput: z.string().max(2000).optional(),
  starterCode: z.string().max(8000).optional(),
  language: z.string().max(20).optional(), // 'javascript' | 'python' | etc.
  points: z.coerce.number().int().min(1).max(100).default(10),
  orderIndex: z.coerce.number().int().min(0).default(0),
  timeLimitSecs: z.coerce.number().int().min(0).max(3600).optional(),
});

export const createAssessmentSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  durationMinutes: z.coerce.number().int().min(1).max(240).default(60),
  passingScore: z.coerce.number().int().min(0).max(100).default(60),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  questions: z.array(questionInputSchema).min(1).max(20),
  jobId: z.string().optional(), // Optional link to a job
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;

export const submitAssessmentSchema = z.object({
  attemptId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      answer: z.string().max(8000), // free text, code, or selected option
    }),
  ),
  tabSwitchCount: z.coerce.number().int().min(0).max(1000).default(0),
});

export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>;

export const assignAssessmentSchema = z.object({
  applicationId: z.string().min(1),
  assessmentId: z.string().min(1),
  dueAt: z.coerce.date().optional(),
});

export type AssignAssessmentInput = z.infer<typeof assignAssessmentSchema>;
