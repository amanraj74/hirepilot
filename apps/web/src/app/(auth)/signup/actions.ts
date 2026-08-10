'use server';

import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/db';
import { signupSchema } from '@/lib/validations/auth';
import { sendEmail } from '@/server/email/transport';
import { EmailVerificationTemplate } from '@/server/email/templates/email-verification';

export type SignupState = { error: string; fieldErrors?: Record<string, string[]> } | undefined;

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  });

  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: 'An account with that email already exists.' };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      // Candidates auto-verify (no recruiter features to gate).
      // Recruiters stay PENDING_VERIFICATION until they confirm their email.
      emailVerified: role === 'CANDIDATE' ? new Date() : null,
      status: role === 'RECRUITER' ? 'PENDING_VERIFICATION' : 'ACTIVE',
    },
  });

  if (role === 'RECRUITER') {
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: email,
      subject: 'Verify your HirePilot recruiter account',
      react: EmailVerificationTemplate({ name, verifyUrl }),
    });
  }

  redirect('/login?registered=1');
}
