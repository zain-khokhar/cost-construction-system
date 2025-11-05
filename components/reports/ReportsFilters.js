'use client';

import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ReportsFilters({
  filters,
  projects,
  phases,
  categories,
  items,
  vendors,
  onFilterChange,
  onReset,
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Project Filter */}
        <Select
          label="Project"
          options={[
            { value: '', label: 'All Projects' },
            ...projects.map((p) => ({ value: p._id, label: p.name })),
          ]}
          value={filters.projectId}
          onChange={(e) => onFilterChange('projectId', e.target.value)}
        />

        {/* Phase Filter */}
        <Select
          label="Phase"
          options={[
            { value: '', label: 'All Phases' },
            ...phases.map((p) => ({ value: p._id, label: p.name })),
          ]}
          value={filters.phaseId}
          onChange={(e) => onFilterChange('phaseId', e.target.value)}
          disabled={!filters.projectId}
        />

        {/* Category Filter */}
        <Select
          label="Category"
          options={[
            { value: '', label: 'All Categories' },
            ...categories.map((c) => ({ value: c._id, label: c.name })),
          ]}
          value={filters.categoryId}
          onChange={(e) => onFilterChange('categoryId', e.target.value)}
          disabled={!filters.phaseId}
        />

        {/* Item Filter */}
        <Select
          label="Item"
          options={[
            { value: '', label: 'All Items' },
            ...items.map((i) => ({ value: i._id, label: i.name })),
          ]}
          value={filters.itemId}
          onChange={(e) => onFilterChange('itemId', e.target.value)}
          disabled={!filters.categoryId}
        />

        {/* Vendor Filter */}
        <Select
          label="Vendor"
          options={[
            { value: '', label: 'All Vendors' },
            ...vendors.map((v) => ({ value: v._id, label: v.name })),
          ]}
          value={filters.vendorId}
          onChange={(e) => onFilterChange('vendorId', e.target.value)}
        />

        {/* Start Date Filter */}
        <Input
          label="Start Date"
          type="date"
          value={filters.startDate}
          onChange={(e) => onFilterChange('startDate', e.target.value)}
        />

        {/* End Date Filter */}
        <Input
          label="End Date"
          type="date"
          value={filters.endDate}
          onChange={(e) => onFilterChange('endDate', e.target.value)}
        />
      </div>

      {/* Reset Filters Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={onReset}
          disabled={
            !filters.projectId &&
            !filters.phaseId &&
            !filters.categoryId &&
            !filters.itemId &&
            !filters.vendorId &&
            !filters.startDate &&
            !filters.endDate
          }
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
