import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';
import { getMockUser, isMockAuthEnabled } from './mockAuth';

const JWT_SECRET = process.env.JWT_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

export function signJwt(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt(token) {
  try {
    console.log('[AUTH] Verifying JWT token, length:', token?.length);
    const result = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH] JWT verification successful:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('[AUTH] JWT verification failed:', error.message);
    console.error('[AUTH] Token that failed:', token?.substring(0, 50));
    return null;
  }
}

export function setAuthCookie(token) {
  return serialize('auth_token', token, {
    httpOnly: true,
    secure: false, // Set to false for development (localhost)
    sameSite: 'lax', // Changed to lax for better compatibility
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function clearAuthCookie() {
  return serialize('auth_token', '', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export function getUserFromRequest(request) {
  // MOCK AUTH FOR TESTING - Return mock user without checking token
  if (isMockAuthEnabled()) {
    console.log('[AUTH] Mock auth enabled, returning mock user');
    return getMockUser();
  }

  // Real authentication
  try {
    // For Next.js App Router, use request.cookies if available
    let token;
    
    if (request.cookies?.get) {
      // Next.js middleware or API routes with NextRequest
      token = request.cookies.get('auth_token')?.value;
      console.log('[AUTH] Token from request.cookies:', token ? `${token.substring(0, 20)}...` : 'null');
    } else {
      // Fallback to parsing cookie header
      const cookieHeader = request.headers.get('cookie') || '';
      console.log('[AUTH] Cookie header:', cookieHeader);
      const cookies = parse(cookieHeader);
      token = cookies.auth_token;
      console.log('[AUTH] Token from parsed header:', token ? `${token.substring(0, 20)}...` : 'null');
    }

    if (!token) {
      console.log('[AUTH] No token found in request');
      return null;
    }

    const payload = verifyJwt(token);
    console.log('[AUTH] Token verified, payload:', payload ? `user=${payload.sub}, role=${payload.role}` : 'null');
    return payload;
  } catch (error) {
    console.error('[AUTH] Error getting user from request:', error);
    return null;
  }
}
