'use client';

import { getCurrencySymbol } from '@/lib/utils/currencies';

export default function ReportsSummary({ summary, totalRecords, projectBudgets, hasProjectFilter, currency = 'USD' }) {
  const { totalSpending, totalBudget, remainingBudget } = summary;
  const isOverBudget = remainingBudget < 0;
  const budgetUtilization = totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Records */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-gray-900">{totalRecords.toLocaleString()}</p>
        </div>

        {/* Total Spending */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Spending</p>
          <p className="text-2xl font-bold text-blue-600">
            {getCurrencySymbol(currency)}{totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Total Budget - Only show if project filter is selected */}
        {hasProjectFilter ? (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">
              Project Budget{projectBudgets?.length > 1 ? 's' : ''}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {getCurrencySymbol(currency)}{totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {projectBudgets && projectBudgets.length > 0 && (
              <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                {projectBudgets.map((project, idx) => (
                  <p key={idx} className="text-xs text-gray-500">
                    {project.name}: {getCurrencySymbol(project.currency || currency)}{project.budget.toLocaleString()}
                  </p>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Project Budget</p>
            <p className="text-sm text-gray-400 mt-2">
              Select a project to view budget
            </p>
          </div>
        )}

        {/* Remaining Budget */}
        {hasProjectFilter ? (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">
              {isOverBudget ? 'Over Budget' : 'Remaining Budget'}
            </p>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              {getCurrencySymbol(currency)}{Math.abs(remainingBudget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Remaining Budget</p>
            <p className="text-sm text-gray-400 mt-2">
              Select a project to view
            </p>
          </div>
        )}

        {/* Budget Utilization */}
        {hasProjectFilter && totalBudget > 0 ? (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Budget Utilization</p>
            <p className={`text-2xl font-bold ${
              budgetUtilization > 100 ? 'text-red-600' :
              budgetUtilization > 80 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {budgetUtilization.toFixed(1)}%
            </p>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Budget Utilization</p>
            <p className="text-sm text-gray-400 mt-2">
              Select a project to view
            </p>
          </div>
        )}
      </div>

      {/* Warning message if over budget */}
      {hasProjectFilter && isOverBudget && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>⚠️ Warning:</strong> Total spending has exceeded the allocated budget by {getCurrencySymbol(currency)}{Math.abs(remainingBudget).toLocaleString()}.
          </p>
        </div>
      )}
    </div>
  );
}
