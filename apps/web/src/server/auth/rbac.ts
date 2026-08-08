// RBAC helper — server-side enforcement on every API route and Server Action.
// All API routes must call requireRole() as their first line.

import { getServerSession } from 'next-auth';
import { authOptions } from './config';
import type { Role } from '@prisma/client';

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  companyId: string | null;
  twoFactorEnabled: boolean;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireRole(allowed: Role[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowed.includes(user.role)) throw new ForbiddenError();
  return user;
}
