// Public GET /api/jobs/:id — single job detail (used by the job detail page).

import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const job = await prisma.job.findFirst({
    where: { id, status: 'OPEN' },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          website: true,
          industry: true,
          size: true,
          description: true,
          socialLinks: true,
          officeLocations: true,
        },
      },
    },
  });

  if (!job) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Job not found',
        status: 404,
        detail: `No open job with id "${id}".`,
      },
      { status: 404, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  return NextResponse.json({ data: job });
}
