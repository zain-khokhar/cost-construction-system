import { apiHandler } from '@/lib/apiHandler';
import { createItemSchema } from '@/lib/validators/items';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Item from '@/models/Item';
import Category from '@/models/Category';
import Phase from '@/models/Phase';

async function getItems(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const projectId = searchParams.get('projectId');
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  const filter = { companyId: userPayload.companyId };
  
  // If projectId is provided, filter items by categories that belong to phases of this project
  if (projectId) {
    // Get all phases for this project
    const phases = await Phase.find({ projectId, companyId: userPayload.companyId }).select('_id');
    const phaseIds = phases.map(p => p._id);
    
    // Get all categories for these phases
    const categories = await Category.find({ phaseId: { $in: phaseIds }, companyId: userPayload.companyId }).select('_id');
    const categoryIds = categories.map(c => c._id);
    
    // Filter items by these categories
    filter.categoryId = { $in: categoryIds };
  } else if (categoryId) {
    // If only categoryId is provided, use it directly
    filter.categoryId = categoryId;
  }

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
