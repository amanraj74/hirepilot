// 2FA enrollment + disable API.
// All routes require a signed-in session. Enrollment generates a
// fresh secret and QR; the user must prove possession by submitting a
// valid OTP before the secret is committed. Disable requires a
// password re-check so a stolen laptop alone is not enough.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getCurrentUser } from '@/server/auth/rbac';
import {
  buildQrDataUri,
  generateBackupCodes,
  generateSecret,
  hashBackupCode,
  verifyTotp,
} from '@/server/2fa/totp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const verifySchema = z.object({
  token: z.string().regex(/^\d{6}$/),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Unauthorized', status: 401 },
      { status: 401, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  const body = (await req.json().catch(() => null)) as { token?: string } | null;
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Token must be 6 digits', status: 422 },
      { status: 422, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  // Two-phase commit:
  //   1. We store a `pendingSecret` in a Cookie (or, for simplicity,
  //      stash it in the TwoFactorAuth row's secret field with
  //      enabled=false and confirm on a second call).
  //   2. On confirm we flip enabled=true.
  //
  // For demo we keep both phases in one round-trip via the
  // /api/2fa/setup (GET) → /api/2fa/verify (POST) → /api/2fa/enable
  // (POST) flow. This file handles ENABLE only (the final commit).

  const existing = await prisma.twoFactorAuth.findUnique({
    where: { userId: user.id },
  });
  if (!existing || !existing.secret) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'No pending 2FA setup. Call /api/2fa/setup first.',
        status: 409,
      },
      { status: 409, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  if (existing.enabled) {
    return NextResponse.json(
      { type: 'about:blank', title: '2FA already enabled', status: 409 },
      { status: 409, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  if (!verifyTotp(parsed.data.token, existing.secret)) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Invalid code. Try again.', status: 422 },
      { status: 422, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  const backupCodes = generateBackupCodes(10);
  const hashed = backupCodes.map(hashBackupCode);

  await prisma.twoFactorAuth.upsert({
    where: { userId: user.id },
    update: {
      enabled: true,
      secret: existing.secret,
      backupCodes: hashed,
    },
    create: {
      userId: user.id,
      enabled: true,
      secret: existing.secret,
      backupCodes: hashed,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true },
  });

  // Backup codes are returned ONCE — the user must save them.
  return NextResponse.json({
    data: { ok: true, backupCodes },
  });
}
