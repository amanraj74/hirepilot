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
      if (authError.type === 'NEXT_REDIRECT') {
        throw error; // genuine redirect signal — propagate
      }
      // Anything else with a type is an Auth.js internal — surface it.
      console.error('[login] Auth.js error:', authError.type, error);
      return { error: 'Could not sign in. Try again.' };
    }
    // Unknown error — log the real message + stack so Vercel runtime
    // logs have something actionable instead of just a digest.
    console.error('[login] Unhandled error during signIn:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error && (error as Error & { cause?: unknown }).cause,
    });
    throw error;
  }
}
