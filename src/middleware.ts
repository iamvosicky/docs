import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

const protectedPaths = [
  '/app',
  '/dashboard',
  '/(dashboard)',
  '/generate',
  '/upload',
  '/documents',
  '/templates',
  '/contracts',
  '/template',
];

const publicPaths = ['/', '/login', '/api', '/debug', '/test-login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('auth-token')?.value;

  // Validate the JWT (not just check existence)
  let isAuthenticated = false;
  if (token) {
    const payload = await verifyJwt(token);
    isAuthenticated = payload !== null;
  }

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublicPath) {
    if (isAuthenticated && pathname === '/login') {
      return NextResponse.redirect(new URL('/app', request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/app/:path*',
    '/dashboard/:path*',
    '/(dashboard)/:path*',
    '/generate/:path*',
    '/documents/:path*',
    '/templates/:path*',
    '/contracts/:path*',
    '/template/:path*',
    '/login',
    '/',
    '/((?!api|_next|fonts|images|favicon.ico|logo.svg).*)',
  ],
};
