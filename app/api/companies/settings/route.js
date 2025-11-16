import { apiHandler } from '@/lib/apiHandler';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { requirePermission } from '@/lib/roleMiddleware';
import Company from '@/models/Company';

async function getCompanySettings(request) {
  const user = getUserFromRequest(request);
  if (!user) throw new ApiError('Unauthorized', 401);

  // Allow all authenticated users to view company settings
  const company = await Company.findById(user.companyId);
  
  if (!company) {
    throw new ApiError('Company not found', 404);
  }

  return {
    name: company.name,
    defaultCurrency: company.defaultCurrency || 'USD',
    settings: company.settings,
  };
}

async function updateCompanySettings(request) {
  const user = getUserFromRequest(request);
  if (!user) throw new ApiError('Unauthorized', 401);

  // Only admins can update company settings
  requirePermission(user, 'COMPANY_MANAGE');

  const body = await request.json();
  const { defaultCurrency } = body;

  const company = await Company.findById(user.companyId);
  
  if (!company) {
    throw new ApiError('Company not found', 404);
  }

  // Update default currency if provided
  if (defaultCurrency) {
    company.defaultCurrency = defaultCurrency.toUpperCase();
  }

  await company.save();

  return {
    message: 'Company settings updated successfully',
    company: {
      name: company.name,
      defaultCurrency: company.defaultCurrency,
      settings: company.settings,
    },
  };
}

export const GET = apiHandler(getCompanySettings);
export const PATCH = apiHandler(updateCompanySettings);
