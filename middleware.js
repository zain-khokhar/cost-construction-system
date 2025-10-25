import { NextResponse } from 'next/server';
import { verifyJwtEdge } from './lib/authEdge';

// Force Node.js runtime instead of Edge runtime for JWT verification
export const runtime = 'nodejs';

const publicPaths = ['/login', '/signup', '/api/auth/login', '/api/auth/register'];
const publicAssets = ['/_next', '/favicon.ico', '/public'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log('[MIDDLEWARE] ========================================');
  console.log('[MIDDLEWARE] Request to:', pathname);
  console.log('[MIDDLEWARE] Request URL:', request.url);
  
  // Log all cookies for debugging
  const allCookies = request.cookies.getAll();
  console.log('[MIDDLEWARE] All cookies:', allCookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`));

  // AUTHENTICATION DISABLED FOR 1 HOUR - Allow all routes
  // return NextResponse.next();

  // Allow public assets
  if (publicAssets.some((path) => pathname.startsWith(path))) {
    console.log('[MIDDLEWARE] Public asset, allowing');
    return NextResponse.next();
  }

  // Check authentication first
  const token = request.cookies.get('auth_token')?.value;
  console.log('[MIDDLEWARE] auth_token present:', !!token);
  if (token) {
    console.log('[MIDDLEWARE] Token length:', token.length);
    console.log('[MIDDLEWARE] Token start:', token.substring(0, 30));
  }
  
  const payload = token ? await verifyJwtEdge(token) : null;
  console.log('[MIDDLEWARE] Token valid:', !!payload);
  if (payload) {
    console.log('[MIDDLEWARE] Payload:', JSON.stringify(payload));
  } else if (token) {
    console.log('[MIDDLEWARE] Token exists but verification failed');
  }

  // If authenticated and trying to access login/signup, redirect to home
  if (payload && (pathname === '/login' || pathname === '/signup')) {
    console.log('[MIDDLEWARE] Authenticated user accessing login/signup, redirecting to home');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow public paths for non-authenticated users
  if (publicPaths.includes(pathname)) {
    console.log('[MIDDLEWARE] Public path, allowing');
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (!token) {
    console.log('[MIDDLEWARE] No token found, redirecting to login');
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!payload) {
    console.log('[MIDDLEWARE] Token present but invalid, DELETING cookie and redirecting to login');
    // Invalid token, clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  console.log('[MIDDLEWARE] Authenticated, allowing access to:', pathname);
  // Authenticated user accessing protected route
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
