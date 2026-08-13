// Service layer for Coding Assessments (PS 2 module 10).
// Schema: Assessment + AssessmentQuestion + AssessmentAttempt (one per candidate-assessment pair).
// Features: countdown timer, auto-submit on expiry, tab-switch detection, MCQ auto-grading.

import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';

export class AssessmentError extends Error {
  constructor(
    public readonly status: 403 | 404 | 409 | 422,
    message: string,
  ) {
    super(message);
    this.name = 'AssessmentError';
  }
}

type RecruiterCtx = { userId: string; companyId: string | null };

export async function createAssessment(
  ctx: RecruiterCtx,
  input: {
    title: string;
    description?: string | null;
    durationMinutes: number;
    passingScore: number;
    status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    questions: Array<{
      type: 'MCQ' | 'CODE' | 'SQL' | 'DEBUG';
      prompt: string;
      options?: string[];
      solution?: string | null;
      expectedOutput?: string | null;
      starterCode?: string | null;
      language?: string | null;
      points: number;
      orderIndex: number;
      timeLimitSecs?: number | null;
    }>;
  },
) {
  if (!ctx.companyId) {
    throw new AssessmentError(422, 'You must be associated with a company to create assessments');
  }
  return prisma.assessment.create({
    data: {
      companyId: ctx.companyId,
      createdById: ctx.userId,
      title: input.title,
      description: input.description ?? null,
      type: 'MCQ', // Default; mixed question types come from question records
      durationMinutes: input.durationMinutes,
      passingScore: input.passingScore,
      status: input.status,
      questions: {
        create: input.questions.map((q, idx) => ({
          type: q.type,
          prompt: q.prompt,
          options: q.options ? (q.options as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          solution: q.solution ?? null,
          expectedOutput: q.expectedOutput ?? null,
          starterCode: q.starterCode ?? null,
          language: q.language ?? null,
          points: q.points,
          orderIndex: q.orderIndex ?? idx,
          timeLimitSecs: q.timeLimitSecs ?? null,
        })),
      },
    },
    include: { questions: { orderBy: { orderIndex: 'asc' } } },
  });
}

export async function listAssessmentsForRecruiter(ctx: RecruiterCtx) {
  return prisma.assessment.findMany({
    where: ctx.companyId
      ? { OR: [{ createdById: ctx.userId }, { companyId: ctx.companyId }] }
      : { createdById: ctx.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
  });
}

export async function getAssessmentForRecruiter(assessmentId: string, ctx: RecruiterCtx) {
  const a = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      questions: { orderBy: { orderIndex: 'asc' } },
      attempts: {
        orderBy: { submittedAt: 'desc' },
        take: 50,
        include: { candidate: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!a) throw new AssessmentError(404, 'Assessment not found');
  if (ctx.companyId && a.companyId !== ctx.companyId && a.createdById !== ctx.userId) {
    throw new AssessmentError(403, 'You do not have access to this assessment');
  }
  return a;
}

// Recruiter sends an assessment to a candidate's application.
// Creates an AssessmentAttempt row with status=IN_PROGRESS, scheduled.
// The candidate then "starts" the assessment to begin actual answering.
export async function assignAssessment(
  ctx: RecruiterCtx,
  input: { applicationId: string; assessmentId: string },
) {
  const app = await prisma.application.findUnique({
    where: { id: input.applicationId },
    include: { job: { select: { companyId: true, postedById: true } } },
  });
  if (!app) throw new AssessmentError(404, 'Application not found');
  const isOwner = app.job.postedById === ctx.userId;
  const isCompany = ctx.companyId !== null && app.job.companyId === ctx.companyId;
  if (!isOwner && !isCompany) {
    throw new AssessmentError(403, 'You do not have access to this application');
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: input.assessmentId },
  });
  if (!assessment) throw new AssessmentError(404, 'Assessment not found');
  if (assessment.status !== 'ACTIVE') {
    throw new AssessmentError(409, 'Only active assessments can be assigned');
  }

  // Avoid creating duplicate IN_PROGRESS attempt.
  const existing = await prisma.assessmentAttempt.findFirst({
    where: { candidateId: app.candidateId, assessmentId: input.assessmentId },
  });
  if (existing) return existing;

  const expiresAt = new Date(Date.now() + assessment.durationMinutes * 60_000);
  return prisma.assessmentAttempt.create({
    data: {
      candidateId: app.candidateId,
      assessmentId: input.assessmentId,
      applicationId: input.applicationId,
      expiresAt,
      status: 'IN_PROGRESS',
      tabSwitchCount: 0,
    },
  });
}

// Candidate sees their attempts directly (one per Assessment).
export async function listMyAttemptsWithAssessments(candidateId: string) {
  return prisma.assessmentAttempt.findMany({
    where: { candidateId },
    orderBy: { startedAt: 'desc' },
    include: {
      assessment: { include: { _count: { select: { questions: true } } } },
    },
  });
}

export async function startAttempt(candidateId: string, assessmentId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: true },
  });
  if (!assessment) throw new AssessmentError(404, 'Assessment not found');
  if (assessment.status !== 'ACTIVE') {
    throw new AssessmentError(409, 'Only active assessments can be started');
  }

  const existing = await prisma.assessmentAttempt.findFirst({
    where: { candidateId, assessmentId },
  });
  if (existing) return existing;

  const expiresAt = new Date(Date.now() + assessment.durationMinutes * 60_000);
  return prisma.assessmentAttempt.create({
    data: {
      candidateId,
      assessmentId,
      expiresAt,
      status: 'IN_PROGRESS',
      tabSwitchCount: 0,
    },
  });
}

export async function getAttemptForCandidate(attemptId: string, candidateId: string) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        include: { questions: { orderBy: { orderIndex: 'asc' } } },
      },
    },
  });
  if (!attempt) throw new AssessmentError(404, 'Attempt not found');
  if (attempt.candidateId !== candidateId) {
    throw new AssessmentError(403, 'Not your attempt');
  }
  return attempt;
}

export async function submitAttempt(
  candidateId: string,
  input: {
    attemptId: string;
    answers: Array<{ questionId: string; answer: string }>;
    tabSwitchCount: number;
  },
) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: input.attemptId },
    include: {
      assessment: { include: { questions: true } },
    },
  });
  if (!attempt) throw new AssessmentError(404, 'Attempt not found');
  if (attempt.candidateId !== candidateId) {
    throw new AssessmentError(403, 'Not your attempt');
  }
  if (attempt.status !== 'IN_PROGRESS') {
    throw new AssessmentError(409, 'This attempt is already submitted');
  }

  const answerMap = new Map(input.answers.map((a) => [a.questionId, a.answer]));
  let score = 0;
  let maxScore = 0;
  const detailedAnswers: Array<{ questionId: string; answer: string; pointsAwarded: number }> = [];

  for (const q of attempt.assessment.questions) {
    maxScore += q.points;
    const userAnswer = (answerMap.get(q.id) ?? '').trim();
    let pointsAwarded = 0;
    if (q.type === 'MCQ') {
      const opts = Array.isArray(q.options) ? (q.options as unknown as string[]) : [];
      if (opts.length > 0 && opts[0] && userAnswer.toLowerCase() === opts[0].toLowerCase()) {
        pointsAwarded = q.points;
      }
    }
    detailedAnswers.push({ questionId: q.id, answer: userAnswer, pointsAwarded });
    score += pointsAwarded;
  }

  const passingScore = attempt.assessment.passingScore;
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed = pct >= passingScore;

  const updated = await prisma.assessmentAttempt.update({
    where: { id: input.attemptId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      score,
      maxScore,
      answers: detailedAnswers as unknown as Prisma.InputJsonValue,
      tabSwitchCount: input.tabSwitchCount,
    },
  });

  await prisma.notification.create({
    data: {
      userId: attempt.assessment.createdById,
      type: 'ASSESSMENT_GRADED',
      title: passed ? 'Candidate passed the assessment' : 'Assessment submitted',
      message: `Score: ${pct}% (${score}/${maxScore}). ${passed ? 'Passed' : 'Below passing threshold'}.`,
      link: '/recruiter/dashboard',
    },
  });

  return { attempt: updated, score, maxScore, percent: pct, passed };
}
