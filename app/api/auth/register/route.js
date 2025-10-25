import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHandler';
import { ApiError } from '@/lib/errors';
import User from '@/models/User';
import Company from '@/models/Company';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function signJwtJose(payload) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

async function handler(request) {
  const body = await request.json();

  // Validate required fields
  if (!body.name || !body.email || !body.password) {
    throw new ApiError('Name, email, and password are required', 400);
  }

  let companyId = body.companyId;

  // If registering with a new company, create it first
  if (body.companyName && !body.companyId) {
    const company = await Company.create({
      name: body.companyName,
      domain: body.companyDomain || '',
    });
    companyId = company._id.toString();
  }

  // Validate companyId exists
  if (!companyId) {
    throw new ApiError('Company ID or Company Name is required', 400);
  }

  // Check if company exists when joining existing company
  if (body.companyId && !body.companyName) {
    const companyExists = await Company.findById(body.companyId);
    if (!companyExists) {
      throw new ApiError('Company not found', 404);
    }
  }

  const user = await User.create({
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role || 'viewer',
    companyId,
  });

  // Get the final companyId as string
  const finalCompanyId = typeof user.companyId === 'string' 
    ? user.companyId 
    : user.companyId.toString();

  const token = await signJwtJose({
    sub: user._id.toString(),
    role: user.role,
    companyId: finalCompanyId,
  });

  const response = NextResponse.json({
    ok: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: finalCompanyId,
      },
    },
  });

  // IMPORTANT: Next.js 15 has issues with response.cookies.set()
  // Use manual Set-Cookie header instead
  const cookieValue = `auth_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`;
  response.headers.set('Set-Cookie', cookieValue);

  return response;
}

export const POST = apiHandler(handler);
