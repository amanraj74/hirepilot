// POST /api/me/resume  — upload + parse resume
// GET  /api/me/resume  — return current resume status

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import {
  getResumeForUser,
  processResumeUpload,
  ResumeUploadError,
} from '@/server/services/resume.service';

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

  const data = await getResumeForUser(session.user.id);
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { type: 'about:blank', title: 'Unauthorized', status: 401 },
        { status: 401, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    if (session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { type: 'about:blank', title: 'Only candidates can upload resumes', status: 403 },
        { status: 403, headers: { 'content-type': 'application/problem+json' } },
      );
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json(
        { type: 'about:blank', title: 'No file provided', status: 400 },
        { status: 400, headers: { 'content-type': 'application/problem+json' } },
      );
    }

    const parsed = await processResumeUpload({ userId: session.user.id, file });
    return NextResponse.json({
      data: {
        ok: true,
        skills: parsed.skills.map((s) => s.name),
        skillCount: parsed.skills.length,
        yearsExperience: parsed.fields.yearsExperience,
        degreeLevel: parsed.fields.degreeLevel,
      },
    });
  } catch (err) {
    // Always return a structured JSON error so the client can render
    // a useful toast — instead of letting the error bubble to a 500
    // HTML page that the fetch client can't parse.
    if (err instanceof ResumeUploadError) {
      return NextResponse.json(
        { type: 'about:blank', title: err.message, status: err.status },
        { status: err.status, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[resume upload] unhandled error:', err);
    return NextResponse.json(
      {
        type: 'about:blank',
        title: `Upload failed: ${message}`,
        status: 500,
        detail: { stack: err instanceof Error ? err.stack : undefined },
      },
      { status: 500, headers: { 'content-type': 'application/problem+json' } },
    );
  }
}
