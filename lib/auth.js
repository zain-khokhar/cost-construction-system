import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

export function signJwt(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('[AUTH] JWT verification failed:', error.message);
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
  try {
    // For Next.js App Router, use request.cookies if available
    let token;
    
    if (request.cookies?.get) {
      // Next.js middleware or API routes with NextRequest
      token = request.cookies.get('auth_token')?.value;
    } else {
      // Fallback to parsing cookie header
      const cookieHeader = request.headers.get('cookie') || '';
      const cookies = parse(cookieHeader);
      token = cookies.auth_token;
    }

    if (!token) {
      return null;
    }

    const payload = verifyJwt(token);
    return payload;
  } catch (error) {
    console.error('[AUTH] Error getting user from request:', error);
    return null;
  }
}
