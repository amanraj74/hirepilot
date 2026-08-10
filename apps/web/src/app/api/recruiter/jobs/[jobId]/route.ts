// GET    /api/recruiter/jobs/[jobId]  — single job detail
// PATCH  /api/recruiter/jobs/[jobId]  — partial update
// DELETE /api/recruiter/jobs/[jobId]  — soft delete (status=CLOSED, deletedAt=now)

import { NextResponse } from 'next/server';
import { requireRole } from '@/server/auth/rbac';
import {
  getRecruiterJob,
  RecruiterJobError,
  softDeleteJob,
  updateJob,
} from '@/server/services/jobs.service';
import { updateJobSchema } from '@/lib/validations/jobs-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const { jobId } = await ctx.params;
  try {
    const job = await getRecruiterJob(jobId, { userId: user.id, companyId: user.companyId });
    return NextResponse.json({ data: job });
  } catch (err) {
    if (err instanceof RecruiterJobError) {
      return NextResponse.json(
        { type: 'about:blank', title: err.message, status: err.status },
        { status: err.status, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    throw err;
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const { jobId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = updateJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Invalid job payload',
        status: 422,
        detail: parsed.error.flatten().fieldErrors,
      },
      { status: 422, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  const input = parsed.data;
  try {
    const job = await updateJob(
      jobId,
      { userId: user.id, companyId: user.companyId },
      {
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
        status: input.status,
      },
    );
    return NextResponse.json({ data: job });
  } catch (err) {
    if (err instanceof RecruiterJobError) {
      return NextResponse.json(
        { type: 'about:blank', title: err.message, status: err.status },
        { status: err.status, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    throw err;
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const { jobId } = await ctx.params;
  try {
    const job = await softDeleteJob(jobId, { userId: user.id, companyId: user.companyId });
    return NextResponse.json({
      data: { id: job.id, status: job.status, deletedAt: job.deletedAt },
    });
  } catch (err) {
    if (err instanceof RecruiterJobError) {
      return NextResponse.json(
        { type: 'about:blank', title: err.message, status: err.status },
        { status: err.status, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    throw err;
  }
}
