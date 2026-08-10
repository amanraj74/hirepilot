// Service layer for recruiter-scoped Job operations.
// Every function enforces RBAC at the data layer (not just the route) —
// a user can only see/edit jobs they posted OR (if they belong to a company)
// jobs in that company.
//
// Errors: typed UnauthorizedError / ForbiddenError / NotFoundError so
// route handlers can map them to HTTP codes.

import type { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';

export class RecruiterJobError extends Error {
  constructor(
    public readonly status: 403 | 404 | 409,
    message: string,
  ) {
    super(message);
    this.name = 'RecruiterJobError';
  }
}

export type CreateJobInput = {
  title: string;
  department?: string | null;
  location?: string | null;
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  experienceYears?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  skillsRequired: string[];
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  deadline?: Date | null;
  status?: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED' | 'FILLED';
  publish?: boolean;
};

export type UpdateJobInput = Partial<CreateJobInput>;

type RecruiterContext = {
  userId: string;
  companyId: string | null;
};

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export type RecruiterJobListItem = Awaited<ReturnType<typeof listRecruiterJobs>>[number];

export async function listRecruiterJobs(
  ctx: RecruiterContext,
  options: { status?: 'OPEN' | 'PAUSED' | 'CLOSED' | 'DRAFT' | 'FILLED' } = {},
) {
  // Recruiters see jobs they posted OR (if linked to a company) jobs in that company.
  // Admins see all jobs they posted (rare); we'll keep the same scope for now.
  const where: Prisma.JobWhereInput = {
    ...(ctx.companyId
      ? { OR: [{ postedById: ctx.userId }, { companyId: ctx.companyId }] }
      : { postedById: ctx.userId }),
    ...(options.status ? { status: options.status } : {}),
  };

  const jobs = await prisma.job.findMany({
    where,
    orderBy: [{ status: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      company: { select: { id: true, name: true, slug: true, logoUrl: true } },
      _count: {
        select: {
          applications: {
            where: {
              stage: { notIn: ['REJECTED'] },
            },
          },
        },
      },
    },
  });

  return jobs.map((j) => ({
    id: j.id,
    title: j.title,
    department: j.department,
    location: j.location,
    workMode: j.workMode,
    employmentType: j.employmentType,
    experienceLevel: j.experienceLevel,
    experienceYears: j.experienceYears,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    salaryCurrency: j.salaryCurrency,
    skillsRequired: j.skillsRequired,
    status: j.status,
    publishedAt: j.publishedAt,
    deadline: j.deadline,
    createdAt: j.createdAt,
    company: j.company,
    activeApplicantCount: j._count.applications,
  }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertCanEdit(jobId: string, ctx: RecruiterContext) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, postedById: true, companyId: true, status: true, title: true },
  });
  if (!job) throw new RecruiterJobError(404, 'Job not found');
  const isOwner = job.postedById === ctx.userId;
  const isCompanyJob = ctx.companyId !== null && job.companyId === ctx.companyId;
  if (!isOwner && !isCompanyJob) {
    throw new RecruiterJobError(403, 'You do not have access to this job');
  }
  return job;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function getRecruiterJob(jobId: string, ctx: RecruiterContext) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: { select: { id: true, name: true, slug: true, logoUrl: true, website: true } },
      _count: {
        select: {
          applications: { where: { stage: { notIn: ['REJECTED'] } } },
        },
      },
    },
  });
  if (!job) throw new RecruiterJobError(404, 'Job not found');
  const isOwner = job.postedById === ctx.userId;
  const isCompanyJob = ctx.companyId !== null && job.companyId === ctx.companyId;
  if (!isOwner && !isCompanyJob) {
    throw new RecruiterJobError(403, 'You do not have access to this job');
  }
  return job;
}

export async function createJob(ctx: RecruiterContext, input: CreateJobInput) {
  if (!ctx.companyId) {
    throw new RecruiterJobError(
      409,
      'You need to be associated with a company before posting jobs. Complete your company profile first.',
    );
  }

  // If publish=true, status becomes OPEN and publishedAt = now. Otherwise DRAFT.
  const publish = input.publish ?? input.status === 'OPEN';
  const status = input.status ?? (publish ? 'OPEN' : 'DRAFT');

  const job = await prisma.job.create({
    data: {
      companyId: ctx.companyId,
      postedById: ctx.userId,
      title: input.title,
      department: input.department ?? null,
      location: input.location ?? null,
      workMode: input.workMode,
      employmentType: input.employmentType,
      experienceLevel: input.experienceLevel,
      experienceYears: input.experienceYears ?? null,
      salaryMin: input.salaryMin ?? null,
      salaryMax: input.salaryMax ?? null,
      salaryCurrency: input.salaryCurrency ?? 'USD',
      skillsRequired: input.skillsRequired,
      description: input.description,
      requirements: input.requirements ?? null,
      benefits: input.benefits ?? null,
      deadline: input.deadline ?? null,
      status,
      publishedAt: publish ? new Date() : null,
    },
  });

  return job;
}

export async function updateJob(jobId: string, ctx: RecruiterContext, input: UpdateJobInput) {
  await assertCanEdit(jobId, ctx);

  // If transitioning to OPEN and not yet published, set publishedAt = now.
  const data: Prisma.JobUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.department !== undefined) data.department = input.department ?? null;
  if (input.location !== undefined) data.location = input.location ?? null;
  if (input.workMode !== undefined) data.workMode = input.workMode;
  if (input.employmentType !== undefined) data.employmentType = input.employmentType;
  if (input.experienceLevel !== undefined) data.experienceLevel = input.experienceLevel;
  if (input.experienceYears !== undefined) data.experienceYears = input.experienceYears ?? null;
  if (input.salaryMin !== undefined) data.salaryMin = input.salaryMin ?? null;
  if (input.salaryMax !== undefined) data.salaryMax = input.salaryMax ?? null;
  if (input.salaryCurrency !== undefined) data.salaryCurrency = input.salaryCurrency ?? 'USD';
  if (input.skillsRequired !== undefined) data.skillsRequired = input.skillsRequired;
  if (input.description !== undefined) data.description = input.description;
  if (input.requirements !== undefined) data.requirements = input.requirements ?? null;
  if (input.benefits !== undefined) data.benefits = input.benefits ?? null;
  if (input.deadline !== undefined) data.deadline = input.deadline ?? null;
  if (input.status !== undefined) {
    data.status = input.status;
    if (input.status === 'OPEN') {
      // Republish if needed
      const existing = await prisma.job.findUnique({
        where: { id: jobId },
        select: { publishedAt: true },
      });
      if (!existing?.publishedAt) data.publishedAt = new Date();
    }
  }

  return prisma.job.update({ where: { id: jobId }, data });
}

export async function duplicateJob(jobId: string, ctx: RecruiterContext) {
  const original = await prisma.job.findUnique({
    where: { id: jobId },
  });
  if (!original) throw new RecruiterJobError(404, 'Job not found');
  const isOwner = original.postedById === ctx.userId;
  const isCompanyJob = ctx.companyId !== null && original.companyId === ctx.companyId;
  if (!isOwner && !isCompanyJob) {
    throw new RecruiterJobError(403, 'You do not have access to this job');
  }

  return prisma.job.create({
    data: {
      companyId: original.companyId,
      postedById: ctx.userId,
      title: `${original.title} (Copy)`,
      department: original.department,
      location: original.location,
      workMode: original.workMode,
      employmentType: original.employmentType,
      experienceLevel: original.experienceLevel,
      experienceYears: original.experienceYears,
      salaryMin: original.salaryMin,
      salaryMax: original.salaryMax,
      salaryCurrency: original.salaryCurrency,
      skillsRequired: original.skillsRequired,
      description: original.description,
      requirements: original.requirements,
      benefits: original.benefits,
      // Duplicate starts as DRAFT — recruiter edits then publishes.
      status: 'DRAFT',
      publishedAt: null,
      deadline: null,
    },
  });
}

export async function softDeleteJob(jobId: string, ctx: RecruiterContext) {
  await assertCanEdit(jobId, ctx);
  // Closed + soft-deleted — keeps audit trail intact but hides from public listing.
  const job = await prisma.job.update({
    where: { id: jobId },
    data: { status: 'CLOSED', deletedAt: new Date() },
    select: { id: true, status: true, deletedAt: true, title: true },
  });
  return job;
}

export async function getRecruiterDashboardStats(ctx: RecruiterContext) {
  // Aggregate counts over the recruiter's visible jobs.
  const where: Prisma.JobWhereInput = {
    ...(ctx.companyId
      ? { OR: [{ postedById: ctx.userId }, { companyId: ctx.companyId }] }
      : { postedById: ctx.userId }),
  };

  const [jobCounts, applicationCounts] = await Promise.all([
    prisma.job.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    }),
    prisma.application.groupBy({
      by: ['stage'],
      where: { job: { ...where, deletedAt: null } },
      _count: { _all: true },
    }),
  ]);

  const jobsByStatus = Object.fromEntries(jobCounts.map((r) => [r.status, r._count._all]));
  const appsByStage = Object.fromEntries(applicationCounts.map((r) => [r.stage, r._count._all]));

  return {
    totalJobs: Object.values(jobsByStatus).reduce((a, b) => a + b, 0),
    openJobs: jobsByStatus.OPEN ?? 0,
    draftJobs: jobsByStatus.DRAFT ?? 0,
    pausedJobs: jobsByStatus.PAUSED ?? 0,
    closedJobs: jobsByStatus.CLOSED ?? 0,
    filledJobs: jobsByStatus.FILLED ?? 0,
    totalApplications: Object.values(appsByStage).reduce((a, b) => a + b, 0),
    newApplications: appsByStage.APPLIED ?? 0,
    inInterview: (appsByStage.TECHNICAL_INTERVIEW ?? 0) + (appsByStage.HR_INTERVIEW ?? 0),
    offersExtended: appsByStage.OFFER ?? 0,
    hired: appsByStage.HIRED ?? 0,
    rejected: appsByStage.REJECTED ?? 0,
  };
}
