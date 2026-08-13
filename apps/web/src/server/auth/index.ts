// Server-side auth helpers for NextAuth v4 — SINGLE source of truth.
//
// Instantiating NextAuth(authOptions) more than once in the same
// process causes issues (the two instances have separate state, and
// signIn from one won't write cookies the handler from the other
// recognises). The API route at /api/auth/[...nextauth]/route.ts
// imports `authHandler` from here so we have ONE instance per process.
//
// In NextAuth v4, NextAuth(authOptions) returns the request handler
// function itself (NextApiHandler). To re-export it as GET/POST
// route handlers in App Router, we use `export { authHandler as
// GET, authHandler as POST }` in the route file. The v5 `.handlers`
// object form does NOT exist in v4.

import { getServerSession } from 'next-auth';
import NextAuth from 'next-auth';
import { authOptions } from './config';

const _nextAuth = NextAuth(authOptions);

export const auth = () => getServerSession(authOptions);
export const signIn = _nextAuth.signIn;
export const signOut = _nextAuth.signOut;
export const authHandler = _nextAuth;
