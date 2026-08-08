// Augment next-auth types so `session.user.id`, `role`, `companyId`,
// `twoFactorEnabled` are all type-safe throughout the codebase.

import type { Role } from '@prisma/client';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    role: Role;
    companyId?: string | null;
    twoFactorEnabled?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: Role;
      companyId: string | null;
      twoFactorEnabled: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    companyId: string | null;
    twoFactorEnabled: boolean;
  }
}
