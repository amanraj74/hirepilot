import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { startAttempt, AssessmentError } from '@/server/services/assessments.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/candidate/assessments/[id]/start - begin attempt
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Unauthorized', status: 401 },
      { status: 401, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  const { id } = await ctx.params;
  try {
    const attempt = await startAttempt(session.user.id, id);
    return NextResponse.json(
      { data: { attemptId: attempt.id, expiresAt: attempt.expiresAt } },
      { status: 201 },
    );
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
