'use server';

// Server action that triggers NextAuth's Google OAuth flow. The
// signIn() helper throws a NEXT_REDIRECT to the Google Authorize URL
// and the browser follows it. The `redirectTo` is preserved through
// the OAuth round-trip via NextAuth's state cookie.

import { signIn } from '@/server/auth';

export async function googleSignInAction(formData: FormData) {
  const callbackUrl = (formData.get('callbackUrl') as string) || '/dashboard';
  await signIn('google', { redirectTo: callbackUrl });
}
