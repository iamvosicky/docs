import { NextRequest, NextResponse } from 'next/server';

// Define paths that require authentication
const protectedPaths = ['/dashboard'];

// Define paths that are public (no auth required)
const publicPaths = ['/login', '/api', '/debug', '/test-login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the user is authenticated
  const token = request.cookies.get('auth-token')?.value;
  const isAuthenticated = !!token;

  // Check if this is a protected path
  const isProtectedPath = protectedPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // If trying to access protected path without auth, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated user tries to access login, redirect to home
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // For all other cases, continue with the request
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/'
  ]
};
