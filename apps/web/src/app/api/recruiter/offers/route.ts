// POST /api/recruiter/offers  — generate + send an offer letter

import { NextResponse } from 'next/server';
import { requireRole } from '@/server/auth/rbac';
import { OfferError, sendOffer } from '@/server/services/offers.service';
import { sendOfferSchema } from '@/lib/validations/offers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Invalid JSON', status: 400 },
      { status: 400, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  // Normalise benefits — accept either string[] or comma-separated string.
  const rawBenefits = body.benefits;
  let benefits: string[] = [];
  if (Array.isArray(rawBenefits)) {
    benefits = rawBenefits.filter((v): v is string => typeof v === 'string' && v.length > 0);
  } else if (typeof rawBenefits === 'string') {
    benefits = rawBenefits
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const parsed = sendOfferSchema.safeParse({
    ...body,
    benefits,
  });
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
    const { offer } = await sendOffer(
      { userId: user.id, companyId: user.companyId },
      {
        applicationId: parsed.data.applicationId,
        salaryAmount: parsed.data.salaryAmount,
        salaryCurrency: parsed.data.salaryCurrency,
        joiningDate: parsed.data.joiningDate,
        expiresAt: parsed.data.expiresAt,
        location: parsed.data.location || undefined,
        benefits: parsed.data.benefits,
        bodyMarkdown: parsed.data.bodyMarkdown || undefined,
      },
    );
    return NextResponse.json({ data: { id: offer.id, status: offer.status } }, { status: 201 });
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
