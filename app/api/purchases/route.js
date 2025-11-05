import { apiHandler } from '@/lib/apiHandler';
import { createPurchaseSchema } from '@/lib/validators/purchases';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { requirePermission, PERMISSIONS } from '@/lib/roleMiddleware';
import Purchase from '@/models/Purchase';
import '@/models/Item';  // Import to register model
import '@/models/Category';  // Import to register model
import '@/models/Phase';  // Import to register model
import '@/models/Project';  // Import to register model
import '@/models/Vendor';  // Import to register model
import '@/models/User';  // Import to register model
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
  const itemId = searchParams.get('itemId');
  const vendorId = searchParams.get('vendorId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;
  const exportAll = searchParams.get('exportAll') === 'true'; // For exporting all data

  const filter = { companyId: user.companyId };
  if (projectId) filter.projectId = projectId;
  if (phaseId) filter.phaseId = phaseId;
  if (categoryId) filter.categoryId = categoryId;
  if (itemId) filter.itemId = itemId;
  if (vendorId) filter.vendorId = vendorId;
  
  // Date range filter
  if (startDate || endDate) {
    filter.purchaseDate = {};
    if (startDate) filter.purchaseDate.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end date
      filter.purchaseDate.$lte = end;
    }
  }

  // Get total count
  const total = await Purchase.countDocuments(filter);

  // If exportAll is true, fetch all records without pagination
  const query = Purchase.find(filter)
    .populate('itemId', 'name unit')
    .populate('categoryId', 'name')
    .populate('phaseId', 'name')
    .populate('projectId', 'name totalBudget')
    .populate('vendorId', 'name')
    .populate('createdBy', 'name')
    .sort({ purchaseDate: -1 });

  if (!exportAll) {
    query.skip(skip).limit(limit);
  }

  const purchases = await query;

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
