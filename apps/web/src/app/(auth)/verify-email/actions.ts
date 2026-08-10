'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/server/db';

// Verify an email using a token sent during recruiter signup.
// Marks the user verified + ACTIVE, deletes the token (one-time use).

export type VerifyEmailState =
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }
  | undefined;

export async function verifyEmailAction(
  token: string | null,
  email: string | null,
): Promise<VerifyEmailState> {
  if (!token || !email) {
    return { status: 'error', message: 'Invalid verification link.' };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email.toLowerCase(), token } },
  });

  if (!record) {
    return {
      status: 'error',
      message: 'This verification link is invalid or has already been used.',
    };
  }

  if (record.expires < new Date()) {
    // Clean up expired token so the user can request a fresh link later.
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email.toLowerCase(), token } },
    });
    return {
      status: 'error',
      message: 'This verification link has expired. Sign in to request a new one.',
    };
  }

  // Atomically mark verified + delete the token.
  await prisma.$transaction([
    prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: new Date(), status: 'ACTIVE' },
    }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email.toLowerCase(), token } },
    }),
  ]);

  redirect('/login?verified=1');
}
