'use client';

import { useEffect, useState } from 'react';

import { ImageReorder } from '@/components/media/ImageReorder';
import { ImageUploader } from '@/components/media/ImageUploader';
import { Button } from '@/components/ui/Button';
import {
  createAdminProduct,
  getAdminProductById,
  updateAdminProduct,
} from '@/services/admin-service';
import {
  uploadImage,
  deleteImage,
  reorderImages,
  updateImage as updateImageApi,
} from '@/services/media/media-service';

/**
 * AdminProductForm - Enhanced form with image management
 *
 * @param {object} props
 * @param {object} props.product - existing product for edit, null for create
 * @param {Function} props.onSuccess - callback after save
 * @param {Function} props.onCancel - callback to close form
 */
export function AdminProductForm({ product, onSuccess, onCancel }) {
  const isEditing = Boolean(product?.id);

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [showReorder, setShowReorder] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    brandId: '',
    shortDescription: '',
    description: '',
    isActive: true,
  });

  // Load existing product
  useEffect(() => {
    if (product?.id) {
      getAdminProductById(product.id).then(p => {
        setForm({
          name: p.name || '',
          slug: p.slug || '',
          sku: p.sku || '',
          price: p.price?.toString() || '',
          stockQuantity: p.stockQuantity?.toString() || '',
          categoryId: p.categoryId?.toString() || '',
          brandId: p.brandId?.toString() || '',
          shortDescription: p.shortDescription || '',
          description: p.description || '',
          isActive: p.isActive ?? true,
        });

        // Load existing images
        if (p.imageUrls?.length) {
          setImages(
            p.imageUrls.map((url, i) => ({
              id: `existing-${i}`,
              url,
              altText: p.name,
              isPrimary: i === 0,
            }))
          );
        }
      });
    }
  }, [product]);

  const handleInputChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (file, onProgress) => {
    const result = await uploadImage(file, product?.id, onProgress);
    if (result?.url) {
      setImages(prev => [...prev, result]);
    }
    return result;
  };

  const handleRemoveImage = async imageId => {
    // Check if it's an existing image (has real id)
    const image = images.find(img => img.id === imageId);
    if (
      image &&
      !imageId.toString().startsWith('local-') &&
      !imageId.toString().startsWith('existing-')
    ) {
      await deleteImage(imageId);
    }
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleReorder = async newOrder => {
    if (product?.id) {
      await reorderImages(product.id, newOrder);
    }
    setImages(prev => {
      const orderMap = new Map(newOrder.map((id, i) => [id, i]));
      return prev.sort((a, b) => {
        const aIndex = orderMap.get(a.id) ?? 999;
        const bIndex = orderMap.get(b.id) ?? 999;
        return aIndex - bIndex;
      });
    });
  };

  const handleSetPrimary = async imageId => {
    if (product?.id) {
      await updateImageApi(imageId, { isPrimary: true });
    }
    setImages(prev =>
      prev.map(img => ({
        ...img,
        isPrimary: img.id === imageId,
      }))
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        categoryId: form.categoryId,
        brandId: form.brandId,
        imageUrls: images.map(img => img.url),
      };

      if (isEditing) {
        await updateAdminProduct(product.id, payload);
      } else {
        await createAdminProduct(payload);
      }

      onSuccess?.();
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className="w-full h-10 px-3 border border-gray-200 rounded-full text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={e => handleInputChange('slug', e.target.value)}
              className="w-full h-10 px-3 border border-gray-200 rounded-full text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">SKU *</label>
            <input
              type="text"
              value={form.sku}
              onChange={e => handleInputChange('sku', e.target.value)}
              className="w-full h-10 px-3 border border-gray-200 rounded-full text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Price *</label>
            <input
              type="number"
              value={form.price}
              onChange={e => handleInputChange('price', e.target.value)}
              className="w-full h-10 px-3 border border-gray-200 rounded-full text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Stock *</label>
            <input
              type="number"
              value={form.stockQuantity}
              onChange={e => handleInputChange('stockQuantity', e.target.value)}
              className="w-full h-10 px-3 border border-gray-200 rounded-full text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Category ID *</label>
            <input
              type="text"
              value={form.categoryId}
              onChange={e => handleInputChange('categoryId', e.target.value)}
              className="w-full h-10 px-3 border border-gray-200 rounded-full text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Brand ID *</label>
            <input
              type="text"
              value={form.brandId}
              onChange={e => handleInputChange('brandId', e.target.value)}
              className="w-full h-10 px-3 border border-gray-200 rounded-full text-sm"
              required
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-xs font-bold text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Short Description</label>
          <textarea
            value={form.shortDescription}
            onChange={e => handleInputChange('shortDescription', e.target.value)}
            className="w-full h-20 px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => handleInputChange('description', e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none"
          />
        </div>

        {/* Image Upload Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Product Images</h3>
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setShowReorder(!showReorder)}
                className="text-xs text-pink-600 hover:text-pink-700 font-medium"
              >
                {showReorder ? 'Hide reorder' : 'Reorder images'}
              </button>
            )}
          </div>

          {showReorder ? (
            <ImageReorder
              images={images}
              onReorder={handleReorder}
              onSetPrimary={handleSetPrimary}
            />
          ) : (
            <ImageUploader
              onUpload={handleUpload}
              onRemove={handleRemoveImage}
              images={images}
              multiple
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#C0185E]" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AdminProductForm;
