import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    const payload = await verifyJwt(token);

    if (!payload) {
      // Token invalid or expired — clear it
      const response = NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.json(
      {
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
