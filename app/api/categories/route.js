import { apiHandler } from '@/lib/apiHandler';
import { createCategorySchema } from '@/lib/validators/categories';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Category from '@/models/Category';

async function getCategories(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const phaseId = searchParams.get('phaseId');
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  const filter = { companyId: userPayload.companyId };
  if (phaseId) filter.phaseId = phaseId;

  const [categories, totalItems] = await Promise.all([
    Category.find(filter).populate('phaseId', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Category.countDocuments(filter),
  ]);

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: limit,
  };

  return { categories, pagination };
}

async function createCategory(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const body = await request.json();
  const category = await Category.create({
    ...body,
    companyId: userPayload.companyId,
  });

  return { category };
}

export const GET = apiHandler(getCategories);
export const POST = apiHandler(createCategory, { validator: createCategorySchema });
