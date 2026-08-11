// POST /api/candidate/offers/[id]/reject
// (mounted at the same path as accept; rejects with a body flag)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { candidateRejectOffer, OfferError } from '@/server/services/offers.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Unauthorized', status: 401 },
      { status: 401, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  const { id } = await ctx.params;
  try {
    await candidateRejectOffer(session.user.id, id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    if (err instanceof OfferError) {
      return NextResponse.json(
        { type: 'about:blank', title: err.message, status: err.status },
        { status: err.status, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    throw err;
  }
}
