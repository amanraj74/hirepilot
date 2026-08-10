'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/db';
import { resetPasswordSchema } from '@/lib/validations/auth';

export type ResetPasswordState =
  | { error: string; fieldErrors?: Record<string, string[]> }
  | { success: true }
  | undefined;

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = formData.get('token');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (typeof token !== 'string' || typeof email !== 'string') {
    return { error: 'Invalid reset link.' };
  }

  const parsed = resetPasswordSchema.safeParse({
    password: typeof password === 'string' ? password : '',
    confirmPassword: typeof confirmPassword === 'string' ? confirmPassword : '',
  });

  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email.toLowerCase(), token } },
  });

  if (!record || record.expires < new Date()) {
    if (record) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email.toLowerCase(), token } },
      });
    }
    return { error: 'This reset link is invalid or has expired. Request a new one.' };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { passwordHash },
    }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email.toLowerCase(), token } },
    }),
  ]);

  redirect('/login?reset=1');
}
