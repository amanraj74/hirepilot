// GET /api/recruiter/jobs  — list this recruiter's jobs (with active-applicant counts)
// POST /api/recruiter/jobs — create a new job

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/server/auth/rbac';
import { createJob, listRecruiterJobs, RecruiterJobError } from '@/server/services/jobs.service';
import { createJobSchema } from '@/lib/validations/jobs-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  if (status && !['OPEN', 'PAUSED', 'CLOSED', 'DRAFT', 'FILLED'].includes(status)) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Invalid status filter', status: 400 },
      { status: 400, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  try {
    const jobs = await listRecruiterJobs(
      { userId: user.id, companyId: user.companyId },
      { status: status as 'OPEN' | 'PAUSED' | 'CLOSED' | 'DRAFT' | 'FILLED' | undefined },
    );
    return NextResponse.json({ data: jobs });
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

export async function POST(req: Request) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const body = await req.json().catch(() => null);
  const parsed = createJobSchema.safeParse(body);
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
    const job = await createJob(
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
        publish: input.publish,
      },
    );
    return NextResponse.json({ data: job }, { status: 201 });
  } catch (err) {
    if (err instanceof RecruiterJobError) {
      return NextResponse.json(
        { type: 'about:blank', title: err.message, status: err.status },
        { status: err.status, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { type: 'about:blank', title: 'Validation failed', status: 422, detail: err.flatten() },
        { status: 422, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    throw err;
  }
}
