'use server';

import { signIn } from '@/server/auth';

export async function googleSignInAction() {
  await signIn('google', { redirectTo: '/dashboard' });
}
