import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Unauthorized', status: 401 },
      { status: 401, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  const result = await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true, readAt: new Date() },
  });
  return NextResponse.json({ data: { marked: result.count } });
}
