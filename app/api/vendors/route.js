import { apiHandler } from '@/lib/apiHandler';
import { createVendorSchema } from '@/lib/validators/vendors';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Vendor from '@/models/Vendor';

async function getVendors(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  // Get pagination params
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  const query = { companyId: userPayload.companyId };

  // Get total count
  const total = await Vendor.countDocuments(query);

  // Get paginated vendors
  const vendors = await Vendor.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { 
    vendors,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    }
  };
}

async function createVendor(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const body = await request.json();
  const vendor = await Vendor.create({
    ...body,
    companyId: userPayload.companyId,
  });

  return { vendor };
}

export const GET = apiHandler(getVendors);
export const POST = apiHandler(createVendor, { validator: createVendorSchema });
