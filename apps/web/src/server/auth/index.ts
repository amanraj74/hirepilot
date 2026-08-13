// Server-side auth helpers for NextAuth v4.
//
// IMPORTANT: In NextAuth v4 the default `NextAuth(authOptions)` call
// returns the API route handler — NOT a helpers object. The pattern
// `const { auth, signIn, signOut } = NextAuth(authOptions)` only works
// in Auth.js v5. Calling `signIn` from a server action in v4 throws
// "TypeError: ... is not a function" because the destructured value is
// always undefined.
//
// What v4 actually gives us:
//   - NextAuth(authOptions)        → API route handler (use in [...nextauth]/route.ts)
//   - getServerSession(authOptions) → server-side session reader
//
// signIn happens client-side by POSTing to /api/auth/callback/credentials
// (see LoginForm in login-form.tsx).

import { getServerSession } from 'next-auth';
import { authOptions } from './config';

export async function auth() {
  return getServerSession(authOptions);
}

import NextAuth from 'next-auth';
const _nextAuthHelpers = NextAuth(authOptions);
export const signIn = _nextAuthHelpers.signIn;
export const signOut = _nextAuthHelpers.signOut;
