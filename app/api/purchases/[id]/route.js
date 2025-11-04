import { apiHandler } from '@/lib/apiHandler';
import { updatePurchaseSchema } from '@/lib/validators/purchases';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Purchase from '@/models/Purchase';

async function getPurchase(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { id } = await params;
  const purchase = await Purchase.findOne({ _id: id, companyId: userPayload.companyId })
    .populate('itemId', 'name unit')
    .populate('categoryId', 'name')
    .populate('phaseId', 'name')
    .populate('projectId', 'name')
    .populate('vendorId', 'name')
    .populate('createdBy', 'name');

  if (!purchase) throw new ApiError('Purchase not found', 404);

  return { purchase };
}

async function updatePurchase(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const { id } = await params;
  const body = await request.json();

  // Calculate totalCost if quantity or pricePerUnit is provided
  if (body.quantity && body.pricePerUnit) {
    body.totalCost = body.quantity * body.pricePerUnit;
  }

  // Remove empty string fields to avoid ObjectId cast errors
  if (body.vendorId === '') delete body.vendorId;
  if (body.phaseId === '') delete body.phaseId;
  if (body.categoryId === '') delete body.categoryId;

  const purchase = await Purchase.findOneAndUpdate(
    { _id: id, companyId: userPayload.companyId },
    body,
    { new: true, runValidators: true }
  );

  if (!purchase) throw new ApiError('Purchase not found', 404);

  return { purchase };
}

async function deletePurchase(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const { id } = await params;
  const purchase = await Purchase.findOneAndDelete({ _id: id, companyId: userPayload.companyId });

  if (!purchase) throw new ApiError('Purchase not found', 404);

  return { message: 'Purchase deleted successfully' };
}

export const GET = apiHandler(getPurchase);
export const PUT = apiHandler(updatePurchase, { validator: updatePurchaseSchema });
export const DELETE = apiHandler(deletePurchase);
