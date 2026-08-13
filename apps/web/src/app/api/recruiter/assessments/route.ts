import { NextResponse } from 'next/server';
import { requireRole } from '@/server/auth/rbac';
import {
  createAssessment,
  listAssessmentsForRecruiter,
  AssessmentError,
} from '@/server/services/assessments.service';
import { createAssessmentSchema } from '@/lib/validations/assessments';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const items = await listAssessmentsForRecruiter({ userId: user.id, companyId: user.companyId });
  return NextResponse.json({ data: items });
}

export async function POST(req: Request) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const body = await req.json().catch(() => null);
  const parsed = createAssessmentSchema.safeParse(body);
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
    const assessment = await createAssessment(
      { userId: user.id, companyId: user.companyId },
      parsed.data,
    );
    return NextResponse.json({ data: assessment }, { status: 201 });
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
