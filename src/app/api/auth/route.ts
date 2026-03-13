import { NextRequest, NextResponse } from 'next/server';
import { signJwt } from '@/lib/jwt';

export const runtime = 'edge';

// Demo users — replace with database lookup in production
const DEMO_USERS: Record<string, { password: string; name: string; role: string }> = {
  'admin@docs.cz': { password: 'admin123', name: 'Admin', role: 'admin' },
  'user@docs.cz': { password: 'user123', name: 'User', role: 'user' },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Neplatná e-mailová adresa' },
        { status: 400, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: 'Heslo musí mít alespoň 4 znaky' },
        { status: 400, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    // Authenticate user — replace with real DB check in production
    const user = DEMO_USERS[email.toLowerCase()];
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Nesprávný e-mail nebo heslo' },
        { status: 401, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    // Generate JWT
    const token = await signJwt({
      sub: email.toLowerCase(),
      email: email.toLowerCase(),
      name: user.name,
      role: user.role,
    });

    // Build response with user data
    const response = NextResponse.json(
      {
        success: true,
        user: {
          email: email.toLowerCase(),
          name: user.name,
          role: user.role,
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );

    // Set secure HttpOnly cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Chyba při přihlašování' },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
