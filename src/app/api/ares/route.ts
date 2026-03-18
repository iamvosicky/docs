import { NextRequest, NextResponse } from 'next/server';
import { lookupByIco } from '@/lib/ares-client';
import { validateIco } from '@/lib/ico-validator';

/**
 * GET /api/ares?ico=12345678
 *
 * Proxy to ARES API with validation and caching.
 * Runs server-side to avoid CORS issues with ares.gov.cz.
 */
export async function GET(request: NextRequest) {
  const ico = request.nextUrl.searchParams.get('ico');

  if (!ico) {
    return NextResponse.json(
      { success: false, error: 'Parametr "ico" je povinný' },
      { status: 400 },
    );
  }

  // Validate before hitting ARES
  const validation = validateIco(ico);
  if (!validation.valid) {
    return NextResponse.json(
      { success: false, error: validation.error },
      { status: 400 },
    );
  }

  const result = await lookupByIco(validation.normalized);

  if (!result.success) {
    const status = result.statusCode === 404 ? 404 : 502;
    return NextResponse.json(result, { status });
  }

  // Cache successful lookups for 1 hour (ARES data doesn't change often)
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
