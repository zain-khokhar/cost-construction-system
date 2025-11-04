import { apiHandler } from '@/lib/apiHandler';
import { updateProjectSchema } from '@/lib/validators/projects';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
import Project from '@/models/Project';

async function getProject(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { id } = await params;
  const project = await Project.findOne({ _id: id, companyId: userPayload.companyId }).populate(
    'createdBy',
    'name email'
  );

  if (!project) throw new ApiError('Project not found', 404);

  return { project };
}

async function updateProject(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (userPayload.role !== ROLES.ADMIN) {
    throw new ApiError('Only admins can update projects', 403);
  }

  const { id } = await params;
  const body = await request.json();

  const project = await Project.findOneAndUpdate(
    { _id: id, companyId: userPayload.companyId },
    body,
    { new: true, runValidators: true }
  );

  if (!project) throw new ApiError('Project not found', 404);

  return { project };
}

async function patchProject(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (userPayload.role !== ROLES.ADMIN) {
    throw new ApiError('Only admins can update projects', 403);
  }

  const { id } = await params;
  const body = await request.json();

  // Allow partial updates (like status only)
  const project = await Project.findOneAndUpdate(
    { _id: id, companyId: userPayload.companyId },
    body,
    { new: true, runValidators: true }
  );

  if (!project) throw new ApiError('Project not found', 404);

  return { project };
}

async function deleteProject(request, { params }) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  if (userPayload.role !== ROLES.ADMIN) {
    throw new ApiError('Only admins can delete projects', 403);
  }

  const { id } = await params;
  const project = await Project.findOneAndDelete({ _id: id, companyId: userPayload.companyId });

  if (!project) throw new ApiError('Project not found', 404);

  return { message: 'Project deleted successfully' };
}

export const GET = apiHandler(getProject);
export const PUT = apiHandler(updateProject, { validator: updateProjectSchema });
export const PATCH = apiHandler(patchProject); // No validator for partial updates
export const DELETE = apiHandler(deleteProject);
