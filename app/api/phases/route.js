import { apiHandler } from '@/lib/apiHandler';
import { createPhaseSchema } from '@/lib/validators/phases';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { canManager } from '@/lib/roles';
import Phase from '@/models/Phase';

async function getPhases(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  const filter = { companyId: userPayload.companyId };
  if (projectId) filter.projectId = projectId;

  const [phases, totalItems] = await Promise.all([
    Phase.find(filter).populate('projectId', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Phase.countDocuments(filter),
  ]);

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: limit,
  };

  return { phases, pagination };
}

async function createPhase(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (!canManager(userPayload.role)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  const body = await request.json();
  const phase = await Phase.create({
    ...body,
    companyId: userPayload.companyId,
  });

  return { phase };
}

export const GET = apiHandler(getPhases);
export const POST = apiHandler(createPhase, { validator: createPhaseSchema });
