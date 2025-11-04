import { apiHandler } from '@/lib/apiHandler';
import { createPurchaseSchema } from '@/lib/validators/purchases';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { requirePermission, PERMISSIONS } from '@/lib/roleMiddleware';
import Purchase from '@/models/Purchase';
import { checkProjectBudgetAlerts } from '@/lib/notificationService';

async function getPurchases(request) {
  const user = getUserFromRequest(request);
  if (!user) throw new ApiError('Unauthorized', 401);

  // All roles can view purchases
  requirePermission(user, 'EXPENSE_VIEW');

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const phaseId = searchParams.get('phaseId');
  const categoryId = searchParams.get('categoryId');
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  const filter = { companyId: user.companyId };
  if (projectId) filter.projectId = projectId;
  if (phaseId) filter.phaseId = phaseId;
  if (categoryId) filter.categoryId = categoryId;

  // Get total count
  const total = await Purchase.countDocuments(filter);

  const purchases = await Purchase.find(filter)
    .populate('itemId', 'name unit')
    .populate('categoryId', 'name')
    .populate('phaseId', 'name')
    .populate('projectId', 'name')
    .populate('vendorId', 'name')
    .populate('createdBy', 'name')
    .sort({ purchaseDate: -1 })
    .skip(skip)
    .limit(limit);

  return { 
    purchases,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    }
  };
}

async function createPurchase(request) {
  const user = getUserFromRequest(request);
  if (!user) throw new ApiError('Unauthorized', 401);

  // Admins and Managers can create purchases (log expenses)
  requirePermission(user, 'EXPENSE_CREATE');

  const body = await request.json();
  const purchase = await Purchase.create({
    ...body,
    createdBy: user.sub,
    companyId: user.companyId,
  });

  // Check budget alerts after purchase
  if (purchase.projectId) {
    await checkProjectBudgetAlerts(purchase.projectId, user.companyId);
  }

  return { purchase };
}

export const GET = apiHandler(getPurchases);
export const POST = apiHandler(createPurchase, { validator: createPurchaseSchema });
