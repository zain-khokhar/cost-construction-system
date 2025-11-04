import { apiHandler } from '@/lib/apiHandler';
import { updateItemSchema } from '@/lib/validators/items';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Item from '@/models/Item';

async function getItem(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { id } = await params;
  const item = await Item.findOne({ _id: id, companyId: userPayload.companyId })
    .populate('categoryId', 'name')
    .populate('defaultVendor', 'name');

  if (!item) throw new ApiError('Item not found', 404);

  return { item };
}

async function updateItem(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const { id } = await params;
  const body = await request.json();

  // Remove empty string fields to avoid ObjectId cast errors
  if (body.defaultVendor === '') delete body.defaultVendor;

  const item = await Item.findOneAndUpdate(
    { _id: id, companyId: userPayload.companyId },
    body,
    { new: true, runValidators: true }
  );

  if (!item) throw new ApiError('Item not found', 404);

  return { item };
}

async function deleteItem(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const { id } = await params;
  const item = await Item.findOneAndDelete({ _id: id, companyId: userPayload.companyId });

  if (!item) throw new ApiError('Item not found', 404);

  return { message: 'Item deleted successfully' };
}

export const GET = apiHandler(getItem);
export const PUT = apiHandler(updateItem, { validator: updateItemSchema });
export const DELETE = apiHandler(deleteItem);
