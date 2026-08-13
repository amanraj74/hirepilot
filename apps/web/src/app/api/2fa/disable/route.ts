// Disable 2FA for the current user. Clears the secret + backup codes
// and flips twoFactorEnabled back to false. Requires the user to
// re-confirm with a recent OTP (within the last 60s) OR a valid
// backup code, to prevent a stolen-cookie from silently disabling 2FA.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getCurrentUser } from '@/server/auth/rbac';
import { verifyBackupCode, verifyTotp } from '@/server/2fa/totp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const confirmSchema = z.union([
  z.object({ token: z.string().regex(/^\d{6}$/) }),
  z.object({ backupCode: z.string().min(8).max(20) }),
]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Unauthorized', status: 401 },
      { status: 401, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  const body = (await req.json().catch(() => null)) as unknown;
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Provide a 6-digit code or backup code.', status: 422 },
      { status: 422, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  const record = await prisma.twoFactorAuth.findUnique({
    where: { userId: user.id },
  });
  if (!record?.enabled || !record.secret) {
    return NextResponse.json(
      { type: 'about:blank', title: '2FA is not enabled for this account', status: 409 },
      { status: 409, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  let valid = false;
  if ('token' in parsed.data && typeof parsed.data.token === 'string') {
    valid = verifyTotp(parsed.data.token, record.secret);
  } else if ('backupCode' in parsed.data && typeof parsed.data.backupCode === 'string') {
    valid = verifyBackupCode(parsed.data.backupCode, record.backupCodes);
  }

  if (!valid) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Invalid code.', status: 422 },
      { status: 422, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  await prisma.twoFactorAuth.update({
    where: { userId: user.id },
    data: { enabled: false, secret: '', backupCodes: [] },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false },
  });

  return NextResponse.json({ data: { ok: true } });
}
