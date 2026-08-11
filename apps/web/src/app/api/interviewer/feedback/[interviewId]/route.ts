// POST /api/interviewer/feedback/[interviewId]  submit scorecard

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { InterviewError, submitFeedback } from '@/server/services/interviews.service';
import { submitFeedbackSchema } from '@/lib/validations/interviews';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request, ctx: { params: Promise<{ interviewId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Unauthorized', status: 401 },
      { status: 401, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  const { interviewId } = await ctx.params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Invalid JSON', status: 400 },
      { status: 400, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  const parsed = submitFeedbackSchema.safeParse({ ...body, interviewId });
  if (!parsed.success) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Validation failed',
        status: 422,
        detail: parsed.error.flatten().fieldErrors,
      },
      { status: 422, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  try {
    const feedback = await submitFeedback(session.user.id, {
      interviewId: parsed.data.interviewId,
      technicalSkills: parsed.data.technicalSkills,
      communication: parsed.data.communication,
      problemSolving: parsed.data.problemSolving,
      teamwork: parsed.data.teamwork,
      leadership: parsed.data.leadership,
      overallRating: parsed.data.overallRating,
      recommendation: parsed.data.recommendation,
      comments: parsed.data.comments,
    });
    return NextResponse.json({ data: { id: feedback.id } }, { status: 201 });
  } catch (err) {
    if (err instanceof InterviewError) {
      return NextResponse.json(
        { type: 'about:blank', title: err.message, status: err.status },
        { status: err.status, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    throw err;
  }
}
