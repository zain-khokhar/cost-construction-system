'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';

export default function ImageUpload({ 
  value, 
  onChange, 
  onError,
  placeholder = "Upload invoice image...",
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      onError?.('Invalid file type. Please upload an image or PDF.');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      onError?.(`File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB.`);
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/invoice', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.ok) {
        onChange?.(result.data.url);
      } else {
        onError?.(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError?.('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Invoice Image (Optional)
      </label>
      
      {value ? (
        // Show uploaded image
        <div className="relative group">
          <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
            <img
              src={value}
              alt="Invoice"
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-black/70 bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Hover and click X to remove
          </p>
        </div>
      ) : (
        // Show upload area
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
              <p className="text-xs text-gray-500">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Images or PDF, max {(maxSize / 1024 / 1024).toFixed(0)}MB
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept={acceptedTypes.join(',')}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}