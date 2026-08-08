import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = 'ok';
  } catch (err) {
    checks.db = 'error';
    healthy = false;
    console.error('[/api/health] db check failed', err);
  }

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      version: '0.1.0',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
