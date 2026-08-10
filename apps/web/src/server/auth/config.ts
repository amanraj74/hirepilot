// Auth.js v4 (NextAuth) configuration with App Router adapter.
// Stable choice for the 6-day sprint — battle-tested, well-documented.
//
// Providers:
//   - Google OAuth (optional — disabled if env vars not set)
//   - Credentials (email + password with bcrypt)
//
// Strategy: JWT sessions (no DB session lookups per request).

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/server/db';
import type { Role } from '@prisma/client';

const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 }, // 7 days
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    ...(googleConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Email + Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        // Always run bcrypt.compare — even against a dummy hash when the user
        // doesn't exist — to avoid timing-based email enumeration.
        const DUMMY_HASH = '$2b$12$abcdefghijklmnopqrstuOiYnVkxY9eF1lNpWmRxLGD8xkS4kPm7u';
        const hashToCheck = user?.passwordHash ?? DUMMY_HASH;
        const passwordOk = await bcrypt.compare(credentials.password, hashToCheck);

        if (!user || !passwordOk) return null;
        if (user.status === 'SUSPENDED') return null;

        // Update last-login timestamp (fire-and-forget; never blocks sign-in).
        void prisma.user
          .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
          .catch(() => {});

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          companyId: user.companyId,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First time jwt is called (after sign-in), user is the returned value
      // from authorize() (Credentials) or from the adapter (OAuth).
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId ?? null;
        token.twoFactorEnabled = user.twoFactorEnabled ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose role + companyId + 2FA flag on session.user
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.companyId = (token.companyId as string | null) ?? null;
        session.user.twoFactorEnabled = (token.twoFactorEnabled as boolean) ?? false;
      }
      return session;
    },
  },
  events: {
    // signIn / signOut / createUser hooks go here when audit log ships (D4-xx)
  },
  debug: process.env.NODE_ENV === 'development',
};
