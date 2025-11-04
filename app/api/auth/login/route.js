import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHandler';
import { loginSchema } from '@/lib/validators/auth';
import { ApiError } from '@/lib/errors';
import User from '@/models/User';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function signJwtJose(payload) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

async function handler(request) {
  console.log('[LOGIN] Starting login handler');
  const { email, password } = await request.json();
  console.log('[LOGIN] Login attempt for email:', email);

  const user = await User.findOne({ email });

  if (!user) {
    console.log('[LOGIN] User not found:', email);
    throw new ApiError('Invalid email or password', 401);
  }

  console.log('[LOGIN] User found:', user._id);

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    console.log('[LOGIN] Password invalid for:', email);
    throw new ApiError('Invalid email or password', 401);
  }

  console.log('[LOGIN] Password valid');

  // Check if user account is pending approval
  if (user.status === 'pending') {
    console.log('[LOGIN] User account pending approval:', email);
    throw new ApiError('Your account is pending approval from the company admin. Please wait for approval.', 403);
  }

  // Check if user account is rejected
  if (user.status === 'rejected') {
    console.log('[LOGIN] User account rejected:', email);
    throw new ApiError('Your account request has been rejected by the company admin.', 403);
  }

  // Ensure companyId is a string
  const companyIdString = typeof user.companyId === 'string' 
    ? user.companyId 
    : user.companyId.toString();

  console.log('[LOGIN] Creating JWT token for user:', user._id, 'company:', companyIdString);

  const token = await signJwtJose({
    sub: user._id.toString(),
    role: user.role,
    companyId: companyIdString,
  });

  console.log('[LOGIN] JWT token created, length:', token.length);

  const response = NextResponse.json({
    ok: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: companyIdString,
      },
    },
  });

  // IMPORTANT: Next.js 15 has issues with response.cookies.set()
  // Use manual Set-Cookie header instead
  const cookieValue = `auth_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`;
  response.headers.set('Set-Cookie', cookieValue);

  console.log('[LOGIN] Cookie set manually in header');
  console.log('[LOGIN] Cookie value:', cookieValue.substring(0, 100));
  
  // Verify the Set-Cookie header is actually present
  const setCookieHeader = response.headers.get('set-cookie');
  console.log('[LOGIN] Set-Cookie header present:', !!setCookieHeader);
  if (setCookieHeader) {
    console.log('[LOGIN] Set-Cookie header value:', setCookieHeader.substring(0, 100));
  }

  return response;
}

export const POST = apiHandler(handler, { validator: loginSchema });
