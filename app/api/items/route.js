import { apiHandler } from '@/lib/apiHandler';
import { createItemSchema } from '@/lib/validators/items';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Item from '@/models/Item';

async function getItems(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  const filter = { companyId: userPayload.companyId };
  if (categoryId) filter.categoryId = categoryId;

  const [items, totalItems] = await Promise.all([
    Item.find(filter)
      .populate('categoryId', 'name')
      .populate('defaultVendor', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Item.countDocuments(filter),
  ]);

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: limit,
  };

  return { items, pagination };
}

async function createItem(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const body = await request.json();
  const item = await Item.create({
    ...body,
    companyId: userPayload.companyId,
  });

  return { item };
}

export const GET = apiHandler(getItems);
export const POST = apiHandler(createItem, { validator: createItemSchema });
