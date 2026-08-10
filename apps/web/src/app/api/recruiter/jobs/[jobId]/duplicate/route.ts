// POST /api/recruiter/jobs/[jobId]/duplicate  — clone as DRAFT

import { NextResponse } from 'next/server';
import { requireRole } from '@/server/auth/rbac';
import { duplicateJob, RecruiterJobError } from '@/server/services/jobs.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const { jobId } = await ctx.params;
  try {
    const job = await duplicateJob(jobId, { userId: user.id, companyId: user.companyId });
    return NextResponse.json({ data: job }, { status: 201 });
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
