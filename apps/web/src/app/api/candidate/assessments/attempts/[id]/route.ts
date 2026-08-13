// GET /api/candidate/assessments/attempts/[id] - get attempt + questions
// POST /api/candidate/assessments/attempts/[id]/submit - submit

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import {
  AssessmentError,
  getAttemptForCandidate,
  submitAttempt,
} from '@/server/services/assessments.service';
import { submitAssessmentSchema } from '@/lib/validations/assessments';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Unauthorized', status: 401 },
      { status: 401, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  const { id: attemptId } = await ctx.params;
  try {
    const attempt = await getAttemptForCandidate(attemptId, session.user.id);
    // Strip the solutions before returning to candidate.
    const safeQuestions = attempt.assessment.questions.map((q) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      options: Array.isArray(q.options) ? q.options : null,
      starterCode: q.starterCode,
      language: q.language,
      points: q.points,
      orderIndex: q.orderIndex,
      timeLimitSecs: q.timeLimitSecs,
    }));
    return NextResponse.json({
      data: {
        attempt: {
          id: attempt.id,
          assessmentId: attempt.assessmentId,
          status: attempt.status,
          expiresAt: attempt.expiresAt,
          tabSwitchCount: attempt.tabSwitchCount,
          durationMinutes: attempt.assessment.durationMinutes,
        },
        questions: safeQuestions,
      },
    });
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

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Unauthorized', status: 401 },
      { status: 401, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  const { id: attemptId } = await ctx.params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = submitAssessmentSchema.safeParse({ ...body, attemptId });
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
    const result = await submitAttempt(session.user.id, {
      attemptId: parsed.data.attemptId,
      answers: parsed.data.answers,
      tabSwitchCount: parsed.data.tabSwitchCount,
    });
    return NextResponse.json({ data: result });
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
