'use client';

import { GripVertical, Star } from 'lucide-react';
import { useState } from 'react';

/**
 * ImageReorder - Drag to reorder images
 *
 * @param {object} props
 * @param {Array} props.images - [{ id, url, altText, isPrimary }]
 * @param {Function} props.onReorder - async function(newOrder: imageIds)
 * @param {Function} props.onSetPrimary - async function(imageId)
 * @param {string} props.className
 */
export function ImageReorder({ images = [], onReorder, onSetPrimary, className = '' }) {
  const [items, setItems] = useState(images);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleDragStart = index => {
    setDraggedIndex(index);
  };

  const handleDragEnter = index => {
    if (draggedIndex === null || index === draggedIndex) return;
    setDragOverIndex(index);

    // Reorder locally
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    setDragOverIndex(null);

    if (!onReorder) return;

    const imageIds = items.map(img => img.id);
    setSaving(true);

    try {
      await onReorder(imageIds);
    } catch (err) {
      console.error('Failed to save order:', err);
      // Revert to original order on error
      setItems(images);
    } finally {
      setSaving(false);
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleSetPrimary = async image => {
    if (!image?.id || !onSetPrimary) return;

    try {
      await onSetPrimary(image.id);
      setItems(prev =>
        prev.map(img => ({
          ...img,
          isPrimary: img.id === image.id,
        }))
      );
    } catch (err) {
      console.error('Failed to set primary:', err);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Drag to reorder ({items.length} images)
        </span>
        {saving && <span className="text-xs text-pink-600">Saving...</span>}
      </div>

      <div className="space-y-2">
        {items.map((image, index) => (
          <div
            key={image.id || `item-${index}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            className={`
              flex items-center gap-3 p-3 bg-white border rounded-xl transition-all
              ${draggedIndex === index ? 'opacity-50 scale-98' : ''}
              ${dragOverIndex === index ? 'border-pink-400 bg-pink-50' : 'border-gray-200'}
              cursor-grab active:cursor-grabbing
            `}
          >
            {/* Drag Handle */}
            <div className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600">
              <GripVertical className="h-5 w-5" />
            </div>

            {/* Image Thumbnail */}
            <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={image.url}
                alt={image.altText || `Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-700">
                {index + 1}
              </div>
            </div>

            {/* Image Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {image.altText || `Image ${index + 1}`}
              </p>
              <p className="text-xs text-gray-400 truncate">{image.url}</p>
            </div>

            {/* Primary Toggle */}
            <button
              type="button"
              onClick={() => handleSetPrimary(image)}
              className={`
                flex-shrink-0 p-2 rounded-full transition-colors
                ${
                  image.isPrimary
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-400 hover:bg-pink-100 hover:text-pink-600'
                }
              `}
              title={image.isPrimary ? 'Primary image' : 'Set as primary'}
            >
              <Star className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Drag images to change their order. First image is the main product image.
      </p>
    </div>
  );
}

export default ImageReorder;
