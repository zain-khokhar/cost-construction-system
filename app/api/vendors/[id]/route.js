import { apiHandler } from '@/lib/apiHandler';
import { updateVendorSchema } from '@/lib/validators/vendors';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { requirePermission } from '@/lib/roleMiddleware';
import Vendor from '@/models/Vendor';

async function getVendor(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { id } = await params;
  const vendor = await Vendor.findOne({ _id: id, companyId: userPayload.companyId });

  if (!vendor) throw new ApiError('Vendor not found', 404);

  return { vendor };
}

async function updateVendor(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  // Only admins can update vendors
  requirePermission(userPayload, 'VENDOR_UPDATE');

  const { id } = await params;
  const body = await request.json();

  const vendor = await Vendor.findOneAndUpdate(
    { _id: id, companyId: userPayload.companyId },
    body,
    { new: true, runValidators: true }
  );

  if (!vendor) throw new ApiError('Vendor not found', 404);

  return { vendor };
}

async function deleteVendor(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  // Only admins can delete vendors
  requirePermission(userPayload, 'VENDOR_DELETE');
  const { id } = await params;
  const vendor = await Vendor.findOneAndDelete({ _id: id, companyId: userPayload.companyId });

  if (!vendor) throw new ApiError('Vendor not found', 404);

  return { message: 'Vendor deleted successfully' };
}

export const GET = apiHandler(getVendor);
export const PUT = apiHandler(updateVendor, { validator: updateVendorSchema });
export const DELETE = apiHandler(deleteVendor);
