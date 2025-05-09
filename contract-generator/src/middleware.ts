import { NextRequest, NextResponse } from 'next/server';

// Define paths that require authentication
const protectedPaths = [
  // Admin routes
  '/dashboard',
  '/(dashboard)',

  // Document generation routes
  '/generate',
  '/documents',
  '/templates',
  '/contracts'
];

// Define paths that are public (no auth required)
const publicPaths = ['/', '/login', '/api', '/debug', '/test-login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the user is authenticated
  const token = request.cookies.get('auth-token')?.value;
  const isAuthenticated = !!token;

  // Check if this is a public path
  const isPublicPath = publicPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if this is a protected path
  const isProtectedPath = protectedPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // If this is a public path, allow access regardless of authentication
  if (isPublicPath) {
    // If authenticated user tries to access login, redirect to home
    if (isAuthenticated && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Otherwise, allow access to public paths
    return NextResponse.next();
  }

  // If trying to access protected path without auth, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For all other cases, continue with the request
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    // Admin protected paths
    '/dashboard/:path*',
    '/(dashboard)/:path*',

    // Document generation protected paths
    '/generate/:path*',
    '/documents/:path*',
    '/templates/:path*',
    '/contracts/:path*',

    // Public paths that need special handling
    '/login',
    '/',

    // Catch-all for any other paths that might need authentication
    '/((?!api|_next|fonts|images|favicon.ico|logo.svg).*)'
  ]
};
