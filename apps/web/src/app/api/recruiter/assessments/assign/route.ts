import { NextResponse } from 'next/server';
import { requireRole } from '@/server/auth/rbac';
import { assignAssessment, AssessmentError } from '@/server/services/assessments.service';
import { assignAssessmentSchema } from '@/lib/validations/assessments';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const body = await req.json().catch(() => null);
  const parsed = assignAssessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Validation failed',
        status: 422,
        detail: parsed.error.flatten(),
      },
      { status: 422, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  try {
    const attempt = await assignAssessment(
      { userId: user.id, companyId: user.companyId },
      { applicationId: parsed.data.applicationId, assessmentId: parsed.data.assessmentId },
    );
    return NextResponse.json({ data: attempt }, { status: 201 });
  } catch (err) {
    if (err instanceof AssessmentError) {
      return NextResponse.json(
        { type: 'about:blank', title: err.message, status: err.status },
        { status: err.status, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    throw err;
  }
}
