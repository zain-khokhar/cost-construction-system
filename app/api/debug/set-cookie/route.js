import { NextResponse } from 'next/server';

// Debug route to verify server can set cookies via NextResponse
export async function GET() {
  const response = NextResponse.json({ ok: true, data: { message: 'Set debug cookie' } });

  // Use a non-httpOnly cookie so it is visible in document.cookie for quick debugging
  response.cookies.set('debug_test', '1', {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 60, // 1 minute
    path: '/',
  });

  return response;
}
