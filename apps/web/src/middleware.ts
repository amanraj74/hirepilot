// Edge middleware — runs before any page render. Protects authenticated routes.
// Public routes: /, /login, /signup, /forgot-password, /reset-password,
// /verify-email, /jobs, /jobs/[id], /api/auth/*, /api/health, /_next/*.

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

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
