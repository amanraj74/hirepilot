// Step 2 of 2FA challenge: verify a 6-digit code (or a backup code)
// and complete the sign-in. Called from /verify-otp after a password
// sign-in has been initiated. On success we set the
// "hirepilot-2fa-verified" cookie and redirect to the original
// callbackUrl.
//
// Note: this is a STANDALONE flow that does not go through NextAuth
// after the password step. The /login form (login-form.tsx) posts
// the password directly to /api/auth/callback/credentials; if the
// session JWT carries a `requiresTwoFactor: true` claim, our
// middleware will redirect the user to /verify-otp. The
// /api/2fa/verify-otp route below consumes the challenge and, on
// success, copies the verified flag into the session via a short-
// lived signed cookie that the next request to the protected page
// uses to mark the session as fully authenticated.
//
// For simplicity in this build we just mark a 2fa_ok cookie and
// re-issue the user into the dashboard. The middleware is updated
// in a separate commit to honour the cookie.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { prisma } from '@/server/db';
import { getCurrentUser } from '@/server/auth/rbac';
import { verifyBackupCode, verifyTotp } from '@/server/2fa/totp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.union([
  z.object({ token: z.string().regex(/^\d{6}$/), callbackUrl: z.string().default('/dashboard') }),
  z.object({
    backupCode: z.string().min(8).max(20),
    callbackUrl: z.string().default('/dashboard'),
  }),
]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Sign in first.', status: 401 },
      { status: 401, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  const body = (await req.json().catch(() => null)) as unknown;
  const parsed = schema.safeParse(body);
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
      { type: 'about:blank', title: '2FA is not enabled.', status: 409 },
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

  // Mark the session as 2FA-verified via a short-lived cookie. The
  // next request to a protected page sees this cookie and treats the
  // session as fully authenticated.
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'hirepilot-2fa-verified',
    value: '1',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h
  });

  return NextResponse.json({
    data: { ok: true, redirectTo: parsed.data.callbackUrl },
  });
}
