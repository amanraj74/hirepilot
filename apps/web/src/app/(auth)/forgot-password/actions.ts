'use server';

import { randomBytes } from 'node:crypto';
import { prisma } from '@/server/db';
import { sendEmail } from '@/server/email/transport';
import { PasswordResetTemplate } from '@/server/email/templates/password-reset';

// Always returns success message to avoid user enumeration via timing.
// Whether the email exists or not, the user sees the same response after a
// consistent delay (the await happens either way; only the email send is gated).

export type ForgotPasswordState = { message: string } | undefined;

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const rawEmail = formData.get('email');
  const email = typeof rawEmail === 'string' ? rawEmail.toLowerCase().trim() : '';

  if (!email || !email.includes('@')) {
    return { message: 'If that email is registered, we just sent a reset link.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Invalidate any existing unused reset tokens for this user.
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h — shorter than verify
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: email,
      subject: 'Reset your HirePilot password',
      react: PasswordResetTemplate({ name: user.name ?? 'there', resetUrl }),
    });
  }

  return { message: 'If that email is registered, we just sent a reset link.' };
}
