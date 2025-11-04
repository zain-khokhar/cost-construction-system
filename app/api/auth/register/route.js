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
  let isFirstUser = false;
  let userStatus = 'active'; // Default status
  let userRole = body.role || 'viewer';

  // If registering with a new company, create it first
  if (body.companyName && !body.companyId) {
    const company = await Company.create({
      name: body.companyName,
      domain: body.companyDomain || '',
    });
    companyId = company._id.toString();
    isFirstUser = true; // First user of new company becomes admin
    
    // If manager creates new company, upgrade to admin
    if (body.role === 'manager' || body.role === 'admin') {
      userRole = 'admin';
    }
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
    
    // Check if there's already an admin in this company
    const existingAdmin = await User.findOne({ companyId: body.companyId, role: 'admin', status: 'active' });
    
    if (existingAdmin && (body.role === 'manager' || body.role === 'viewer')) {
      // If admin exists and user is manager/viewer, set status to pending
      userStatus = 'pending';
    } else if (!existingAdmin) {
      // If no admin exists, first user becomes admin
      userRole = 'admin';
      userStatus = 'active';
    }
  }

  // Create user
  const user = await User.create({
    name: body.name,
    email: body.email,
    password: body.password,
    role: isFirstUser ? 'admin' : userRole,
    status: userStatus,
    companyId,
  });

  // If user is pending, return different response
  if (userStatus === 'pending') {
    return NextResponse.json({
      ok: true,
      data: {
        message: 'Registration successful! Your request has been sent to the company admin for approval.',
        status: 'pending',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
    });
  }

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
