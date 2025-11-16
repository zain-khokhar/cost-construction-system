import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {string} file - Base64 encoded file or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result with URL
 */
export async function uploadImage(file, options = {}) {
  try {
    const defaultOptions = {
      folder: 'construction-invoices',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1600, crop: 'limit' }, // Limit size for invoices
        { quality: 'auto:good' }, // Optimize quality
      ],
      ...options,
    };

    const result = await cloudinary.uploader.upload(file, defaultOptions);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} - Deletion result
 */
export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
}

export default cloudinary;