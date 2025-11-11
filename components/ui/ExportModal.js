'use client';

import { useState } from 'react';
import Button from './Button';
import Card from './Card';

/**
 * ExportModal - Reusable modal for exporting data in PDF or CSV format
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {string} exportType - Type of export (items, categories, phases, vendors, purchases)
 * @param {string} projectId - Optional project ID for filtering
 * @param {string} title - Modal title
 * @param {function} onExportData - Optional custom function to fetch export data (receives format as param)
 * @param {object} exportParams - Optional additional params to pass to export API
 * @param {array} selectedIds - Optional array of selected item IDs to export
 * @param {boolean} exportAll - Optional flag to export all items across all pages
 */
export default function ExportModal({ 
  isOpen, 
  onClose, 
  exportType, 
  projectId = null, 
  title = 'Export Data',
  onExportData = null,
  exportParams = {},
  selectedIds = [],
  exportAll = false
}) {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // If custom export data function is provided, use it
      if (onExportData) {
        const data = await onExportData(selectedFormat);
        if (!data || data.length === 0) {
          alert('No data available to export');
          return;
        }
        // Continue with default export flow using the data
      }

      let url = `/api/export/${exportType}?format=${selectedFormat}`;
      if (projectId) {
        url += `&projectId=${projectId}`;
      }
      
      // Add exportAll flag if set
      if (exportAll) {
        url += `&exportAll=true`;
      }
      
      // Add selectedIds if provided
      if (selectedIds && selectedIds.length > 0 && !exportAll) {
        url += `&selectedIds=${selectedIds.join(',')}`;
      }
      
      // Add any additional export params
      Object.entries(exportParams).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const extension = selectedFormat === 'pdf' ? 'pdf' : 'csv';
      link.download = `${exportType}-report-${Date.now()}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <div className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">{title}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Export Format</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={selectedFormat === 'pdf'}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium">PDF Document</div>
                    <div className="text-sm text-gray-500">
                      Best for printing and sharing formatted reports
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={selectedFormat === 'csv'}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium">CSV File</div>
                    <div className="text-sm text-gray-500">
                      Best for data analysis in Excel or other tools
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              className="flex-1"
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
