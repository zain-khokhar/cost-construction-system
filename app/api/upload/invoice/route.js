import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHandler';
import { getUserFromRequest } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

/**
 * Upload invoice image to Cloudinary
 * POST /api/upload/invoice
 */
async function handler(request) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image');
    
    if (!file) {
      return NextResponse.json(
        { ok: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Check file type - allow images and PDFs
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid file type. Please upload an image or PDF.' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadOptions = {
      folder: `construction-invoices/${user.companyId}`,
      public_id: `invoice_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      resource_type: file.type === 'application/pdf' ? 'raw' : 'image',
    };

    // Add image transformations if it's an image
    if (file.type.startsWith('image/')) {
      uploadOptions.transformation = [
        { width: 1200, height: 1600, crop: 'limit' },
        { quality: 'auto:good' },
      ];
    }

    const uploadResult = await uploadImage(base64, uploadOptions);

    return {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('Image upload error:', error);
    
    if (error.message.includes('Invalid image file') || error.message.includes('Invalid format')) {
      return NextResponse.json(
        { ok: false, error: 'Invalid file format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { ok: false, error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}

export const POST = apiHandler(handler);
