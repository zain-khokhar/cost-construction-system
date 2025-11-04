import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHandler';
import { getUserFromRequest } from '@/lib/auth';
import { ApiError } from '@/lib/errors';
import User from '@/models/User';

/**
 * Get pending user requests for admin approval
 * GET /api/auth/pending-requests
 */
async function getHandler(request) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    throw new ApiError('Unauthorized', 401);
  }
  
  // Only admins can view pending requests
  if (user.role !== 'admin') {
    throw new ApiError('Only admins can view pending requests', 403);
  }
  
  // Get all pending users for this company
  const pendingUsers = await User.find({
    companyId: user.companyId,
    status: 'pending'
  }).select('-password').sort({ createdAt: -1 });
  
  return {
    requests: pendingUsers,
    count: pendingUsers.length
  };
}

/**
 * Approve or reject a user request
 * POST /api/auth/pending-requests
 * Body: { userId, action: 'approve' | 'reject' }
 */
async function postHandler(request) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    throw new ApiError('Unauthorized', 401);
  }
  
  // Only admins can approve/reject requests
  if (user.role !== 'admin') {
    throw new ApiError('Only admins can approve or reject requests', 403);
  }
  
  const body = await request.json();
  const { userId, action } = body;
  
  if (!userId || !action) {
    throw new ApiError('User ID and action are required', 400);
  }
  
  if (action !== 'approve' && action !== 'reject') {
    throw new ApiError('Action must be either "approve" or "reject"', 400);
  }
  
  // Find the pending user
  const pendingUser = await User.findOne({
    _id: userId,
    companyId: user.companyId,
    status: 'pending'
  });
  
  if (!pendingUser) {
    throw new ApiError('Pending user not found', 404);
  }
  
  // Update user status
  if (action === 'approve') {
    pendingUser.status = 'active';
    await pendingUser.save();
    
    return {
      message: `User ${pendingUser.name} has been approved`,
      user: {
        id: pendingUser._id,
        name: pendingUser.name,
        email: pendingUser.email,
        role: pendingUser.role,
        status: pendingUser.status
      }
    };
  } else {
    pendingUser.status = 'rejected';
    await pendingUser.save();
    
    return {
      message: `User ${pendingUser.name} has been rejected`,
      user: {
        id: pendingUser._id,
        name: pendingUser.name,
        email: pendingUser.email,
        role: pendingUser.role,
        status: pendingUser.status
      }
    };
  }
}

export const GET = apiHandler(getHandler);
export const POST = apiHandler(postHandler);
