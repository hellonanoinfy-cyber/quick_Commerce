import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';
import { unwrapData } from '@/lib/api/error-handler';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validate a file for upload
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Allowed: JPG, PNG, WEBP' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size: 5MB' };
  }
  return { valid: true };
}

/**
 * Compress image client-side before upload
 * @param {File} file
 * @param {number} quality
 * @returns {Promise<Blob>}
 */
export async function compressImage(file, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Max dimensions
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1920;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        blob => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to compress image'));
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Upload a single image file
 * @param {File} file
 * @param {string|number} productId
 * @param {function} onProgress
 * @returns {Promise<object>}
 */
export async function uploadImage(file, productId = null, onProgress = null) {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Compress image
  const compressedFile = await compressImage(file);

  const formData = new FormData();
  formData.append('file', compressedFile, file.name);
  if (productId) {
    formData.append('productId', productId);
  }

  const response = await api.post(API_ENDPOINTS.media.upload, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: event => {
      if (onProgress && event.total) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      }
    },
  });

  return unwrapData(response);
}

/**
 * Upload multiple images
 * @param {File[]} files
 * @param {string|number} productId
 * @param {function} onProgress
 * @returns {Promise<object[]>}
 */
export async function uploadImages(files, productId = null, onProgress = null) {
  const results = [];
  const total = files.length;
  let completed = 0;

  for (const file of files) {
    try {
      const result = await uploadImage(file, productId, progress => {
        if (onProgress) {
          const overallProgress = Math.round((completed * 100 + progress) / total);
          onProgress(overallProgress);
        }
      });
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      results.push({ error: error.message, fileName: file.name });
    }
    completed++;
  }

  return results;
}

/**
 * Get product images
 * @param {string|number} productId
 * @returns {Promise<object[]>}
 */
export async function getProductImages(productId) {
  const response = await api.get(API_ENDPOINTS.media.productImages(productId));
  return unwrapData(response) || [];
}

/**
 * Update image metadata
 * @param {string|number} imageId
 * @param {object} data - { altText?, isPrimary?, sortOrder? }
 * @returns {Promise<object>}
 */
export async function updateImage(imageId, data) {
  const response = await api.put(API_ENDPOINTS.media.update(imageId), data);
  return unwrapData(response);
}

/**
 * Delete an image
 * @param {string|number} imageId
 * @returns {Promise<void>}
 */
export async function deleteImage(imageId) {
  await api.delete(API_ENDPOINTS.media.delete(imageId));
}

/**
 * Reorder product images
 * @param {string|number} productId
 * @param {string[]} imageIds - ordered array of image IDs
 * @returns {Promise<void>}
 */
export async function reorderImages(productId, imageIds) {
  await api.put(API_ENDPOINTS.media.reorder, { productId, imageIds });
}
