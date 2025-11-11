'use client';

import Button from '@/components/ui/Button';

export default function ProjectHeader({ project, activeTab, onExport }) {
  const getExportButtonText = () => {
    switch (activeTab) {
      case 'phases': return 'Export Phases';
      case 'categories': return 'Export Categories';
      case 'items': return 'Export Items';
      case 'purchases': return 'Export Purchases';
      default: return 'Export';
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 max-sm:p-2 mb-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Client:</span>
              <span>{project.client}</span>
            </div>
            {project.location && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Location:</span>
                <span>{project.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium">Budget:</span>
              <span className="text-green-600 font-semibold">
                ${project.totalBudget?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <Button onClick={onExport}>
          {getExportButtonText()}
        </Button>
      </div>
    </div>
  );
}
