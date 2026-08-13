// Pending-2FA cookie helpers. Stored as a short-lived JSON blob on
// the user's browser after a successful password POST when 2FA is
// enabled. The /verify-otp page reads this cookie, validates the OTP,
// then clears it.

import { cookies } from 'next/headers';

const PENDING_COOKIE = 'hirepilot-2fa-pending';
const PENDING_TTL_MS = 10 * 60 * 1000; // 10 minutes

export type Pending2FA = {
  userId: string;
  email: string;
  callbackUrl: string;
  /** ms since epoch */
  exp: number;
};

export async function setPending2FACookie(payload: {
  userId: string;
  email: string;
  callbackUrl: string;
}): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: PENDING_COOKIE,
    value: JSON.stringify({ ...payload, exp: Date.now() + PENDING_TTL_MS }),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });
}

export async function clearPending2FACookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_COOKIE);
}
