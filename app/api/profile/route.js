import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHandler';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/models/User';
import Company from '@/models/Company';
import { z } from 'zod';

// Validator for profile update
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

/**
 * GET /api/profile - Get current user profile
 */
async function getProfile(request) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }

  const userDoc = await User.findById(user.sub)
    .select('-password')
    .populate('companyId', 'name');

  if (!userDoc) {
    return NextResponse.json(
      { ok: false, error: { message: 'User not found' } },
      { status: 404 }
    );
  }

  return {
    user: {
      id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      company: userDoc.companyId,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    },
  };
}

/**
 * PUT /api/profile - Update user profile
 */
async function updateProfile(request) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }

  const body = await request.json();
  
  // Validate input
  const validation = updateProfileSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { ok: false, error: { message: validation.error.errors[0].message } },
      { status: 400 }
    );
  }

  const { name, email, currentPassword, newPassword } = validation.data;

  const userDoc = await User.findById(user.sub);
  
  if (!userDoc) {
    return NextResponse.json(
      { ok: false, error: { message: 'User not found' } },
      { status: 404 }
    );
  }

  // Update basic fields
  if (name) userDoc.name = name;
  
  // Check if email is being changed and not already in use
  if (email && email !== userDoc.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { ok: false, error: { message: 'Email already in use' } },
        { status: 400 }
      );
    }
    userDoc.email = email;
  }

  // Handle password change
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json(
        { ok: false, error: { message: 'Current password required to set new password' } },
        { status: 400 }
      );
    }

    const isPasswordValid = await userDoc.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { ok: false, error: { message: 'Current password is incorrect' } },
        { status: 400 }
      );
    }

    userDoc.password = newPassword;
  }

  await userDoc.save();

  // Return updated user (without password)
  const updatedUser = await User.findById(user.sub)
    .select('-password')
    .populate('companyId', 'name');

  return {
    message: 'Profile updated successfully',
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      company: updatedUser.companyId,
      updatedAt: updatedUser.updatedAt,
    },
  };
}

export const GET = apiHandler(getProfile);
export const PUT = apiHandler(updateProfile);
