'use client';

import { useState } from 'react';
import { X, Download, Calendar, Building, Package, User, DollarSign } from 'lucide-react';
import { getCurrencySymbol } from '@/lib/utils/currencies';

export default function PurchaseDetailModal({ 
  purchase, 
  isOpen, 
  onClose,
  currency = 'USD' 
}) {
  if (!isOpen || !purchase) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleImageClick = () => {
    if (purchase.invoiceUrl) {
      window.open(purchase.invoiceUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Purchase Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Invoice Image */}
          {purchase.invoiceUrl && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Invoice Document
              </h3>
              <div className="relative group">
                {/* <div className="bg-gray-100 rounded-lg border p-4">
                  <img
                    src={purchase.invoiceUrl}
                    alt="Invoice"
                    className="w-full max-h-96 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-white shadow-sm"
                    onClick={handleImageClick}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMTJMMTEgMTRMMTUgMTBNMjEgMTJDMjEgMTYuOTcwNiAxNi45NzA2IDIxIDEyIDIxQzcuMDI5NCAyMSAzIDE2Ljk3MDYgMyAxMkMzIDcuMDI5NCA3LjAyOTQgMyAxMiAzQzE2Ljk3MDYgMyAyMSA3LjAyOTQgMjEgMTJaIiBzdHJva2U9IiM2QjcyODAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                      e.target.alt = 'Image failed to load';
                    }}
                  />
                </div> */}
                {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <Download className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div> */}
                {/* <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  Click to view full size
                </div> */}
              </div>
            </div>
          )}

          {/* Purchase Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Item Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Item</p>
                    <p className="text-gray-900 font-semibold">
                      {purchase.itemId?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Project</p>
                    <p className="text-gray-900">
                      {purchase.projectId?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    P
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phase</p>
                    <p className="text-gray-900">
                      {purchase.phaseId?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    C
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Category</p>
                    <p className="text-gray-900">
                      {purchase.categoryId?.name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial & Vendor Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Financial Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Pricing</p>
                    <div className="space-y-1">
                      <p className="text-gray-900">
                        <span className="font-medium">Quantity:</span> {purchase.quantity} {purchase.itemId?.unit || 'units'}
                      </p>
                      <p className="text-gray-900">
                        <span className="font-medium">Unit Price:</span> {getCurrencySymbol(currency)}{parseFloat(purchase.pricePerUnit || 0).toFixed(2)}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        <span className="font-medium text-gray-700">Total:</span> {getCurrencySymbol(currency)}{(purchase.totalCost || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Vendor</p>
                    <p className="text-gray-900">
                      {purchase.vendorId?.name || 'No vendor specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Purchase Date</p>
                    <p className="text-gray-900">
                      {formatDate(purchase.purchaseDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <p className="text-sm text-gray-600">
              Purchased <strong>{purchase.quantity} {purchase.itemId?.unit || 'units'}</strong> of{' '}
              <strong>{purchase.itemId?.name}</strong> from{' '}
              <strong>{purchase.vendorId?.name || 'unspecified vendor'}</strong> for{' '}
              <strong>{getCurrencySymbol(currency)}{(purchase.totalCost || 0).toLocaleString()}</strong>{' '}
              on {formatDate(purchase.purchaseDate)} for the{' '}
              <strong>{purchase.phaseId?.name}</strong> phase of{' '}
              <strong>{purchase.projectId?.name}</strong> project.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex justify-end gap-3">
            {purchase.invoiceUrl && (
              <button
                onClick={handleImageClick}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                View Invoice
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}