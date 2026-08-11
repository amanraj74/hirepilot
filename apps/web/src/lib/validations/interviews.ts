import { z } from 'zod';

export const INTERVIEW_PLATFORMS = ['ZOOM', 'GOOGLE_MEET', 'TEAMS', 'OTHER'] as const;
export const INTERVIEW_TYPES = ['PHONE', 'TECHNICAL', 'HR', 'PANEL', 'ONSITE'] as const;
export const INTERVIEW_STATUS = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const;

export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1),
  type: z.enum(INTERVIEW_TYPES),
  scheduledAt: z.coerce.date({ invalid_type_error: 'Pick a date and time' }),
  durationMins: z.coerce.number().int().min(15).max(240).default(60),
  platform: z.enum(INTERVIEW_PLATFORMS).default('GOOGLE_MEET'),
  meetingLink: z.string().url().optional().or(z.literal('')),
  location: z.string().max(120).optional().or(z.literal('')),
  interviewerIds: z
    .array(z.string().min(1))
    .min(1, 'Pick at least one interviewer')
    .max(5, 'Max 5 interviewers'),
  notes: z.string().max(2_000).optional().or(z.literal('')),
});

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;

export const submitFeedbackSchema = z.object({
  interviewId: z.string().min(1),
  technicalSkills: z.coerce.number().int().min(1).max(5),
  communication: z.coerce.number().int().min(1).max(5),
  problemSolving: z.coerce.number().int().min(1).max(5),
  teamwork: z.coerce.number().int().min(1).max(5),
  leadership: z.coerce.number().int().min(1).max(5),
  overallRating: z.coerce.number().int().min(1).max(5),
  recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'NO_HIRE', 'STRONG_NO_HIRE']),
  comments: z.string().max(2_000).optional().or(z.literal('')),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
