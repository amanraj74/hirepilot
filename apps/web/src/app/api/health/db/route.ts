// GET /api/health/db
//
// Diagnostic endpoint — pings the database and reports what's wrong.
// Useful for debugging the production deploy where the regular
// /api/health endpoint only says "db: ok" if the singleton was
// initialised before; this one forces a fresh query and surfaces the
// actual error message so Vercel runtime logs have something
// human-readable to grep for.

import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // 1. Env var sanity
  checks.envDatabaseUrl = {
    ok: !!process.env.DATABASE_URL,
    detail: process.env.DATABASE_URL ? 'set' : 'missing — set DATABASE_URL on Vercel',
  };
  checks.envDirectUrl = {
    ok: !!process.env.DIRECT_URL,
    detail: process.env.DIRECT_URL ? 'set' : 'missing — set DIRECT_URL on Vercel',
  };
  checks.envAuthSecret = {
    ok: !!process.env.AUTH_SECRET,
    detail: process.env.AUTH_SECRET
      ? `${process.env.AUTH_SECRET.length} chars`
      : 'missing — set AUTH_SECRET on Vercel',
  };
  checks.envNextauthUrl = {
    ok: !!process.env.NEXTAUTH_URL,
    detail: process.env.NEXTAUTH_URL || 'missing',
  };

  // 2. Real DB query — most useful diagnostic.
  try {
    const userCount = await prisma.user.count();
    checks.database = { ok: true, detail: `connected — ${userCount} users` };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    checks.database = {
      ok: false,
      detail: `Prisma error — ${message}`,
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json({ ok: allOk, checks }, { status: allOk ? 200 : 503 });
}
