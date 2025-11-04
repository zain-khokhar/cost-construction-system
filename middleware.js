import { NextResponse } from 'next/server';
import { verifyJwtEdge } from './lib/authEdge';

export const runtime = 'nodejs';

const publicPaths = ['/login', '/signup', '/api/auth/login', '/api/auth/register'];
const publicAssets = ['/_next', '/favicon.ico', '/public'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public assets
  if (publicAssets.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow public paths for non-authenticated users
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = token ? await verifyJwtEdge(token) : null;

  if (!payload) {
    // Invalid token, clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  // If authenticated and trying to access login/signup, redirect to home
  if (payload && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Authenticated user accessing protected route
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
