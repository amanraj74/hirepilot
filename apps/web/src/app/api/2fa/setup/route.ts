// Step 1 of 2FA enrollment. Generates a fresh TOTP secret, stashes it
// in the TwoFactorAuth row with enabled=false, and returns a QR data
// URI + the (one-time) plaintext secret. The user scans the QR with
// an authenticator app, then POSTs a 6-digit code to /api/2fa/enable
// to confirm and commit.

import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getCurrentUser } from '@/server/auth/rbac';
import { buildQrDataUri, generateSecret } from '@/server/2fa/totp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Unauthorized', status: 401 },
      { status: 401, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  const secret = generateSecret();
  const account = user.email ?? user.name ?? `user-${user.id}`;
  const qrCodeDataUri = await buildQrDataUri(account, secret);

  // Upsert with enabled=false. The /enable route flips it to true
  // after the user proves they scanned the code.
  await prisma.twoFactorAuth.upsert({
    where: { userId: user.id },
    update: { secret, enabled: false, backupCodes: [] },
    create: { userId: user.id, secret, enabled: false, backupCodes: [] },
  });

  return NextResponse.json({
    data: { qrCodeDataUri, secret },
  });
}
