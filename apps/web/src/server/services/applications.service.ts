// Service layer for Application state-machine operations.
// Recruiter-scoped: only the applications for jobs they own or in their company.

import type { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';

export class ApplicationError extends Error {
  constructor(
    public readonly status: 403 | 404 | 409 | 422,
    message: string,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export const STAGE_ORDER = [
  'APPLIED',
  'RESUME_SCREENING',
  'SHORTLISTED',
  'TECHNICAL_INTERVIEW',
  'HR_INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED',
] as const;

export type Stage = (typeof STAGE_ORDER)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  APPLIED: 'Applied',
  RESUME_SCREENING: 'Resume screening',
  SHORTLISTED: 'Shortlisted',
  TECHNICAL_INTERVIEW: 'Tech interview',
  HR_INTERVIEW: 'HR interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
};

export const TERMINAL_STAGES: ReadonlySet<Stage> = new Set(['HIRED', 'REJECTED']);

type RecruiterCtx = { userId: string; companyId: string | null };

// Allowed forward transitions. Rejection is allowed from any non-terminal
// stage. Hiring is allowed only from OFFER. Once in HIRED/REJECTED the
// application is locked.
const ALLOWED_TRANSITIONS: Record<Stage, ReadonlySet<Stage>> = {
  APPLIED: new Set<Stage>(['RESUME_SCREENING', 'REJECTED']),
  RESUME_SCREENING: new Set<Stage>(['SHORTLISTED', 'REJECTED']),
  SHORTLISTED: new Set<Stage>(['TECHNICAL_INTERVIEW', 'REJECTED']),
  TECHNICAL_INTERVIEW: new Set<Stage>(['HR_INTERVIEW', 'REJECTED']),
  HR_INTERVIEW: new Set<Stage>(['OFFER', 'REJECTED']),
  OFFER: new Set<Stage>(['HIRED', 'REJECTED']),
  HIRED: new Set<Stage>(),
  REJECTED: new Set<Stage>(),
};

export function isTransitionAllowed(from: Stage, to: Stage): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from].has(to);
}

// ---------------------------------------------------------------------------

export async function listApplicationsForRecruiter(ctx: RecruiterCtx) {
  // Recruiters see applications for jobs they posted OR for jobs in their
  // company. We surface the candidate + job so the Kanban can render rows.
  const jobs = await prisma.job.findMany({
    where: ctx.companyId
      ? { OR: [{ postedById: ctx.userId }, { companyId: ctx.companyId }] }
      : { postedById: ctx.userId },
    select: { id: true },
  });
  const jobIds = jobs.map((j) => j.id);
  if (jobIds.length === 0) return [];

  const apps = await prisma.application.findMany({
    where: { jobId: { in: jobIds }, deletedAt: null },
    orderBy: [{ stage: 'asc' }, { updatedAt: 'desc' }],
    include: {
      candidate: { select: { id: true, name: true, email: true, image: true } },
      job: { select: { id: true, title: true, department: true, companyId: true } },
    },
  });

  return apps.map((a) => ({
    id: a.id,
    stage: a.stage as Stage,
    jobId: a.jobId,
    jobTitle: a.job.title,
    jobDepartment: a.job.department,
    candidateId: a.candidateId,
    candidateName: a.candidate.name ?? a.candidate.email.split('@')[0],
    candidateEmail: a.candidate.email,
    candidateImage: a.candidate.image,
    matchScore: a.matchScore,
    appliedAt: a.appliedAt,
    updatedAt: a.updatedAt,
  }));
}

// ---------------------------------------------------------------------------
// Candidate-facing: apply to a job
// ---------------------------------------------------------------------------

export async function applyToJob(input: {
  jobId: string;
  candidateId: string;
  candidateName: string | null;
  candidateEmail: string;
  coverLetter: string;
}) {
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    select: { id: true, status: true, title: true, postedById: true, companyId: true },
  });
  if (!job) throw new ApplicationError(404, 'Job not found');
  if (job.status !== 'OPEN') {
    throw new ApplicationError(409, 'This job is not accepting new applications');
  }

  const existing = await prisma.application.findFirst({
    where: { jobId: input.jobId, candidateId: input.candidateId, deletedAt: null },
    select: { id: true, stage: true },
  });
  if (existing) {
    throw new ApplicationError(
      409,
      `You already applied to this role — your application is in ${STAGE_LABEL[existing.stage as Stage]}`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const application = await tx.application.create({
      data: {
        jobId: input.jobId,
        candidateId: input.candidateId,
        stage: 'APPLIED',
        coverLetter: input.coverLetter,
        source: 'public_board',
      },
      select: { id: true, stage: true, appliedAt: true },
    });

    // In-app notification for the recruiter who posted the job.
    await tx.notification.create({
      data: {
        userId: job.postedById,
        type: 'NEW_APPLICATION',
        title: 'New application',
        message: `${input.candidateName ?? input.candidateEmail.split('@')[0]} applied for ${job.title}.`,
        link: '/recruiter/pipeline',
      },
    });

    // Audit log entry for the application creation.
    await tx.auditLog.create({
      data: {
        actorId: input.candidateId,
        action: 'application.created',
        resource: 'Application',
        resourceId: application.id,
        newValue: { jobId: job.id, stage: 'APPLIED' } as Prisma.InputJsonValue,
      },
    });

    return application;
  });
}

// ---------------------------------------------------------------------------
// Candidate-facing: list my own applications
// ---------------------------------------------------------------------------

export async function listMyApplications(candidateId: string) {
  const apps = await prisma.application.findMany({
    where: { candidateId, deletedAt: null },
    orderBy: { appliedAt: 'desc' },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          department: true,
          location: true,
          workMode: true,
          employmentType: true,
          status: true,
          company: { select: { name: true, logoUrl: true } },
        },
      },
    },
  });

  return apps.map((a) => ({
    id: a.id,
    stage: a.stage as Stage,
    appliedAt: a.appliedAt,
    updatedAt: a.updatedAt,
    job: {
      id: a.job.id,
      title: a.job.title,
      department: a.job.department,
      location: a.job.location,
      workMode: a.job.workMode,
      employmentType: a.job.employmentType,
      status: a.job.status,
      company: a.job.company.name,
    },
  }));
}

// ---------------------------------------------------------------------------

export async function moveApplicationToStage(
  applicationId: string,
  toStage: Stage,
  ctx: RecruiterCtx & { actorRole: 'RECRUITER' | 'HIRING_MANAGER' | 'ADMIN' },
) {
  // Resolve the application + the recruiter's right to it.
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: { select: { id: true, postedById: true, companyId: true, title: true } },
      candidate: { select: { id: true, name: true, email: true } },
    },
  });
  if (!app || app.deletedAt) throw new ApplicationError(404, 'Application not found');

  const isOwner = app.job.postedById === ctx.userId;
  const isCompanyJob = ctx.companyId !== null && app.job.companyId === ctx.companyId;
  if (!isOwner && !isCompanyJob) {
    throw new ApplicationError(403, 'You do not have access to this application');
  }

  const fromStage = app.stage as Stage;
  if (fromStage === toStage) {
    throw new ApplicationError(422, 'Application is already at this stage');
  }
  if (TERMINAL_STAGES.has(fromStage)) {
    throw new ApplicationError(
      409,
      `Application is in a terminal stage (${STAGE_LABEL[fromStage]}) and cannot be moved`,
    );
  }
  if (!isTransitionAllowed(fromStage, toStage)) {
    throw new ApplicationError(
      422,
      `Cannot move from ${STAGE_LABEL[fromStage]} to ${STAGE_LABEL[toStage]}`,
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const history = Array.isArray(app.stageHistory) ? (app.stageHistory as unknown[]) : [];
    const newApp = await tx.application.update({
      where: { id: applicationId },
      data: {
        stage: toStage,
        updatedAt: new Date(),
        // Append to stage history (snapshot of move).
        stageHistory: [
          ...history,
          { from: fromStage, to: toStage, by: ctx.userId, at: new Date().toISOString() },
        ] as Prisma.InputJsonValue,
      },
    });

    // Audit log: who moved what, from where, to where.
    await tx.auditLog.create({
      data: {
        actorId: ctx.userId,
        action: 'application.stage.moved',
        resource: 'Application',
        resourceId: applicationId,
        oldValue: { stage: fromStage } as Prisma.InputJsonValue,
        newValue: {
          stage: toStage,
          jobId: app.jobId,
          candidateId: app.candidateId,
        } as Prisma.InputJsonValue,
      },
    });

    // In-app notification for the candidate.
    await tx.notification.create({
      data: {
        userId: app.candidateId,
        type: 'STAGE_CHANGED',
        title: `Application update: ${STAGE_LABEL[toStage]}`,
        message: `Your application for "${app.job.title}" moved to ${STAGE_LABEL[toStage]}.`,
        link: '/applications',
      },
    });

    return newApp;
  });

  return updated;
}
