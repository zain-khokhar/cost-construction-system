import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';

// Debug route to inspect the auth_token cookie as seen by the server
export async function GET(request) {
  try {
    // NextRequest exposes cookies via request.cookies
    const cookieFromApi = request.cookies.get('auth_token')?.value || null;

    // Fallback to parsing header for completeness
    const cookieHeader = request.headers.get('cookie') || null;

    const payload = cookieFromApi ? verifyJwt(cookieFromApi) : null;

    return NextResponse.json({
      ok: true,
      data: {
        cookieFromApi,
        cookieHeader,
        payload,
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: { message: String(err) } }, { status: 500 });
  }
}
