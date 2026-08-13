'use server';

// Sign out. NextAuth v4 doesn't have a server-side `signOut` export
// (that pattern is v5). The standard v4 flow is to POST to
// /api/auth/signout with the CSRF token. We fetch the CSRF token here,
// then POST to the endpoint with a server-side redirect.

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function getCsrfToken(): Promise<string> {
  const hdrs = await headers();
  const host = hdrs.get('host') ?? 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const origin = process.env.NEXTAUTH_URL ?? `${proto}://${host}`;
  const res = await fetch(`${origin}/api/auth/csrf`, {
    cache: 'no-store',
    headers: { cookie: (await cookies()).toString() },
  });
  if (!res.ok) throw new Error(`CSRF fetch failed: ${res.status}`);
  const data = (await res.json()) as { csrfToken?: string };
  if (!data.csrfToken) throw new Error('CSRF token missing');
  return data.csrfToken;
}

export async function signOutAction() {
  const csrfToken = await getCsrfToken();
  const hdrs = await headers();
  const host = hdrs.get('host') ?? 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const origin = process.env.NEXTAUTH_URL ?? `${proto}://${host}`;

  const body = new URLSearchParams();
  body.append('csrfToken', csrfToken);
  body.append('callbackUrl', '/');

  await fetch(`${origin}/api/auth/signout`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      cookie: (await cookies()).toString(),
    },
    body: body.toString(),
    redirect: 'manual',
  });

  redirect('/');
}
