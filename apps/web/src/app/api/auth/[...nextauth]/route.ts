// NextAuth.js v4 catch-all route handler. The shared NextAuth
// instance is created in src/server/auth/index.ts and exported as
// the `authHandler` callable. In v4, NextAuth(authOptions) returns
// the request handler function itself — there's no `.handlers`
// object like in v5.

import { authHandler } from '@/server/auth';

export { authHandler as GET, authHandler as POST };
