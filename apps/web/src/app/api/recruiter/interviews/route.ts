// GET /api/recruiter/interviews           list this recruiter's interviews
// POST /api/recruiter/interviews          schedule a new interview

import { NextResponse } from 'next/server';
import { requireRole } from '@/server/auth/rbac';
import {
  InterviewError,
  listInterviewsForRecruiter,
  scheduleInterview,
} from '@/server/services/interviews.service';
import { scheduleInterviewSchema } from '@/lib/validations/interviews';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const interviews = await listInterviewsForRecruiter({
    userId: user.id,
    companyId: user.companyId,
  });
  return NextResponse.json({ data: interviews });
}

export async function POST(req: Request) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Invalid JSON', status: 400 },
      { status: 400, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  // Coerce interviewerIds from JSON (string | string[]) into string[].
  const raw = body.interviewerIds;
  let interviewerIds: string[] = [];
  if (Array.isArray(raw)) {
    interviewerIds = raw.filter((v): v is string => typeof v === 'string');
  } else if (typeof raw === 'string' && raw.length > 0) {
    interviewerIds = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const parsed = scheduleInterviewSchema.safeParse({
    ...body,
    interviewerIds,
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Validation failed',
        status: 422,
        detail: flat.fieldErrors,
      },
      { status: 422, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  try {
    const result = await scheduleInterview(
      { userId: user.id, companyId: user.companyId },
      {
        applicationId: parsed.data.applicationId,
        type: parsed.data.type,
        scheduledAt: parsed.data.scheduledAt,
        durationMins: parsed.data.durationMins,
        platform: parsed.data.platform,
        meetingLink: parsed.data.meetingLink || null,
        location: parsed.data.location || null,
        interviewerIds: parsed.data.interviewerIds,
        notes: parsed.data.notes || null,
      },
    );
    return NextResponse.json({ data: result.interview }, { status: 201 });
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
