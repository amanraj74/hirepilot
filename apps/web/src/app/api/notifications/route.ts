// GET /api/notifications  — list current user's notifications
// POST /api/notifications/mark-all-read  — mark all as read
// GET /api/notifications/unread-count  — count of unread

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { prisma } from '@/server/db';

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
  const items = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 25,
  });
  return NextResponse.json({ data: items });
}
