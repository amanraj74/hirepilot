// Server-side auth helpers (used by server actions and API routes).
// The route handler at app/api/auth/[...nextauth]/route.ts is the canonical
// NextAuth() invocation; this module re-instantiates for signIn/signOut/auth()
// access from server components and actions. Both instances share the same
// PrismaAdapter and JWT secret — sessions and JWTs are interchangeable.

import NextAuth from 'next-auth';
import { authOptions } from './config';

const nextAuth = NextAuth(authOptions);
export const { auth, signIn, signOut } = nextAuth;
