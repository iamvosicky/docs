import { NextRequest, NextResponse } from 'next/server';

// Configure this route to use the Edge Runtime
export const runtime = 'edge';

// This is a simple placeholder for a real authentication API
// In a real implementation, this would validate credentials and issue tokens

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        }
      );
    }

    // In a real implementation, this would:
    // 1. Validate the user exists in the database
    // 2. Generate and send a magic link or validate password
    // 3. Create a session or JWT token

    // For now, we'll simulate a successful authentication
    const response = NextResponse.json(
      {
        success: true,
        message: 'Authentication successful',
        user: {
          email,
          name: email.split('@')[0],
          role: 'admin' // In a real app, this would come from the database
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );

    // In a real implementation, you would set a secure HTTP-only cookie here
    // For now, we'll let the client handle it

    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  }
}

// Add OPTIONS method to handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
