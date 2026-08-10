// NextAuth.js v4 catch-all route handler (App Router pattern, canonical).
// Handles /api/auth/signin, /api/auth/signout, /api/auth/callback/*,
// /api/auth/session, /api/auth/csrf, /api/auth/providers.

import NextAuth from 'next-auth';
import { authOptions } from '@/server/auth/config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
