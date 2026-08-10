// GET /api/recruiter/applications  — list recruiter's pipeline (across all jobs)

import { NextResponse } from 'next/server';
import { requireRole } from '@/server/auth/rbac';
import {
  ApplicationError,
  listApplicationsForRecruiter,
} from '@/server/services/applications.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  try {
    const applications = await listApplicationsForRecruiter({
      userId: user.id,
      companyId: user.companyId,
    });
    return NextResponse.json({ data: applications });
  } catch (err) {
    if (err instanceof ApplicationError) {
      return NextResponse.json(
        { type: 'about:blank', title: err.message, status: err.status },
        { status: err.status, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    throw err;
  }
}
