'use server';

// Server action for the 2FA OTP challenge. Verifies a 6-digit code
// (or a backup code) against the current user's TwoFactorAuth row,
// then sets a short-lived "hirepilot-2fa-verified" cookie that the
// (app) layout can read later. On success, redirects to the original
// callbackUrl.

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/db';
import { getCurrentUser } from '@/server/auth/rbac';
import { verifyBackupCode, verifyTotp } from '@/server/2fa/totp';

const schema = z.union([
  z.object({ token: z.string().regex(/^\d{6}$/), callbackUrl: z.string().default('/dashboard') }),
  z.object({
    backupCode: z.string().min(8).max(20),
    callbackUrl: z.string().default('/dashboard'),
  }),
]);

export type VerifyOtpState = { error?: string; callbackUrl?: string } | undefined;

export async function verifyOtpAction(
  _prev: VerifyOtpState,
  formData: FormData,
): Promise<VerifyOtpState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Your session expired. Please sign in again.' };
  }

  const parsed = schema.safeParse({
    token: formData.get('token'),
    backupCode: formData.get('backupCode'),
    callbackUrl: (formData.get('callbackUrl') as string) || '/dashboard',
  });
  if (!parsed.success) {
    return { error: 'Provide a 6-digit code or backup code.' };
  }

  const record = await prisma.twoFactorAuth.findUnique({
    where: { userId: user.id },
  });
  if (!record?.enabled || !record.secret) {
    return { error: '2FA is not configured for this account.' };
  }

  let valid = false;
  if ('token' in parsed.data && typeof parsed.data.token === 'string') {
    valid = verifyTotp(parsed.data.token, record.secret);
  } else if ('backupCode' in parsed.data && typeof parsed.data.backupCode === 'string') {
    valid = verifyBackupCode(parsed.data.backupCode, record.backupCodes);
  }
  if (!valid) {
    return { error: 'Invalid code. Try again.' };
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: 'hirepilot-2fa-verified',
    value: '1',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  redirect(parsed.data.callbackUrl);
}
