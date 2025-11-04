import { apiHandler } from '@/lib/apiHandler';
import { createProjectSchema } from '@/lib/validators/projects';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { requirePermission, PERMISSIONS } from '@/lib/roleMiddleware';
import Project from '@/models/Project';

async function getProjects(request) {
  const user = getUserFromRequest(request);
  if (!user) throw new ApiError('Unauthorized', 401);

  // All roles can view projects
  requirePermission(user, 'PROJECT_VIEW');

  // Get pagination params from URL
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  // Filter projects by user's company
  const query = { companyId: user.companyId };

  // Get total count for pagination
  const total = await Project.countDocuments(query);

  // Get paginated projects
  const projects = await Project.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { 
    projects,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    }
  };
}

async function createProject(request) {
  const user = getUserFromRequest(request);
  if (!user) throw new ApiError('Unauthorized', 401);

  // Only admins can create projects
  requirePermission(user, 'PROJECT_CREATE');

  const body = await request.json();
  const project = await Project.create({
    ...body,
    createdBy: user.sub,
    companyId: user.companyId,
  });

  return { project };
}

export const GET = apiHandler(getProjects);
export const POST = apiHandler(createProject, { validator: createProjectSchema });
