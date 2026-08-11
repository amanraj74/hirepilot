// GET    /api/interviewer/assignments          my interviews as interviewer
// POST   /api/interviewer/feedback/[interviewId]  submit scorecard

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { listInterviewsForInterviewer } from '@/server/services/interviews.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Unauthorized', status: 401 },
      { status: 401, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  const interviews = await listInterviewsForInterviewer(session.user.id);
  return NextResponse.json({ data: interviews });
}
