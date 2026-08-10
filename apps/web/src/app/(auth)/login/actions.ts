'use server';

import { signIn } from '@/server/auth';
import { loginSchema } from '@/lib/validations/auth';

export type LoginState = { error: string } | undefined;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: 'Enter a valid email and password.' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/dashboard',
    });
    return undefined;
  } catch (error) {
    // signIn throws NEXT_REDIRECT on success — re-throw so Next can handle it.
    // Auth.js v4 attaches a `.type` discriminator on thrown auth errors.
    if (error && typeof error === 'object' && 'type' in error) {
      const authError = error as { type?: string };
      if (authError.type === 'CredentialsSignin') {
        return { error: 'Invalid email or password.' };
      }
      return { error: 'Could not sign in. Try again.' };
    }
    throw error;
  }
}
