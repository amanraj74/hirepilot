// Edge middleware — runs before any page render. Protects authenticated routes
// and applies a simple in-memory rate-limit bucket to auth + candidate API
// routes.
//
// Public routes: /, /login, /signup, /forgot-password, /reset-password,
// /verify-email, /jobs, /jobs/[id], /api/auth/*, /api/health, /_next/*.
//
// Rate-limit caveats: this is a best-effort in-memory bucket. On Vercel the
// edge runtime is stateless, so a cold instance starts with an empty bucket —
// for hard guarantees wire Upstash Redis or Vercel KV. This is the "first
// pass" called out in the TODO and is good enough to deter casual abuse.

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const BUCKETS = new Map<string, { count: number; resetAt: number }>();

const AUTH_PATHS = ['/api/auth/'];
const CANDIDATE_PATHS = ['/api/candidate/'];

function clientIp(req: { headers: Headers; ip?: string | null }): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return req.ip ?? 'unknown';
}

// Lazy eviction — drop expired entries when we get / set a bucket. Keeps the
// map small without needing a background timer in edge runtime.
function getOrCreateBucket(key: string, windowMs: number): { count: number; resetAt: number } {
  const now = Date.now();
  const existing = BUCKETS.get(key);
  if (existing && existing.resetAt >= now) return existing;
  if (BUCKETS.size > 500) {
    for (const [k, v] of BUCKETS) {
      if (v.resetAt < now) BUCKETS.delete(k);
    }
  }
  const fresh = { count: 0, resetAt: now + windowMs };
  BUCKETS.set(key, fresh);
  return fresh;
}

function isRateLimitedPath(pathname: string): boolean {
  return (
    AUTH_PATHS.some((p) => pathname.startsWith(p)) ||
    CANDIDATE_PATHS.some((p) => pathname.startsWith(p))
  );
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Rate-limit auth + candidate API endpoints (5 requests / 60 s / IP).
    if (isRateLimitedPath(pathname)) {
      const ip = clientIp(req);
      const key = `rl:${pathname}:${ip}`;
      const bucket = getOrCreateBucket(key, 60_000);
      const MAX = 5;
      if (bucket.count >= MAX) {
        const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000));
        return new NextResponse(
          JSON.stringify({
            type: 'about:blank',
            title: 'Too many requests',
            status: 429,
            detail: `Rate limit exceeded. Try again in ${retryAfterSec}s.`,
          }),
          {
            status: 429,
            headers: {
              'content-type': 'application/problem+json',
              'retry-after': `${retryAfterSec}`,
              'x-ratelimit-limit': `${MAX}`,
              'x-ratelimit-remaining': '0',
            },
          },
        );
      }
      bucket.count++;
      const response = NextResponse.next();
      response.headers.set('x-ratelimit-limit', `${MAX}`);
      response.headers.set('x-ratelimit-remaining', `${Math.max(0, MAX - bucket.count)}`);
      return response;
    }

    // Redirect authenticated users away from auth pages
    if (token && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const isPublic =
          pathname === '/' ||
          pathname === '/login' ||
          pathname === '/signup' ||
          pathname === '/forgot-password' ||
          pathname === '/reset-password' ||
          pathname === '/verify-email' ||
          pathname.startsWith('/jobs') ||
          pathname === '/pricing' ||
          pathname === '/about' ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/health') ||
          pathname.startsWith('/api/jobs') || // public job board
          pathname.startsWith('/_next') ||
          pathname.startsWith('/api/public');
        if (isPublic) return true;
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  },
);

export const config = {
  matcher: [
    // Run on everything except: static assets, favicon, image optimizer
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
