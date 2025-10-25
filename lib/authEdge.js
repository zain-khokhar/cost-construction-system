// Edge Runtime compatible JWT verification using jose library
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable');
}

// Convert secret to Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET);

export async function verifyJwtEdge(token) {
  try {
    console.log('[AUTH_EDGE] Verifying JWT token in Edge runtime, length:', token?.length);
    const { payload } = await jose.jwtVerify(token, secret);
    console.log('[AUTH_EDGE] JWT verification successful:', JSON.stringify(payload));
    return payload;
  } catch (error) {
    console.error('[AUTH_EDGE] JWT verification failed:', error.message);
    console.error('[AUTH_EDGE] Token that failed:', token?.substring(0, 50));
    return null;
  }
}
