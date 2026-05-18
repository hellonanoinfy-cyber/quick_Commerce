'use client';

import { useState } from 'react';

import { ImagePreview } from '@/components/media/ImagePreview';
import { SmartImage } from '@/components/ui/SmartImage';

/**
 * ImageGallery - Display product images with grid/list view
 *
 * @param {object} props
 * @param {Array} props.images - [{ id, url, altText, isPrimary }]
 * @param {string} props.view - 'grid' | 'list'
 * @param {Function} props.onImageClick - callback when image clicked
 * @param {boolean} props.showThumbnails - show thumbnail strip below main
 * @param {string} props.className
 */
export function ImageGallery({
  images = [],
  view = 'grid',
  onImageClick,
  showThumbnails = true,
  className = '',
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const validImages = images.filter(img => img?.url);
  const activeImage = validImages[activeIndex] || { url: null, altText: 'Product image' };

  const handleImageClick = index => {
    setActiveIndex(index);
    onImageClick?.(validImages[index], index);
  };

  const handleLightboxClose = () => {
    setLightboxOpen(false);
  };

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  if (validImages.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Main Image */}
        <div
          className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 cursor-zoom-in"
          onClick={openLightbox}
        >
          {activeImage.url && (
            <SmartImage
              src={activeImage.url}
              alt={activeImage.altText || 'Product image'}
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={80}
              className="object-cover"
              imageClassName="hover:scale-105 transition-transform duration-300"
            />
          )}

          {/* Image Counter Badge */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 text-white text-xs font-medium rounded-full backdrop-blur-sm">
              {activeIndex + 1} / {validImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {showThumbnails && validImages.length > 1 && (
          <div
            className={`flex gap-3 overflow-x-auto pb-2 scrollbar-hide ${
              view === 'list' ? 'flex-col' : ''
            }`}
          >
            {validImages.map((image, index) => (
              <button
                key={image.id || `thumb-${index}`}
                onClick={() => handleImageClick(index)}
                className={`
                  flex-shrink-0 relative overflow-hidden rounded-xl border-2 transition-all
                  ${view === 'list' ? 'w-full h-20' : 'w-20 h-20'}
                  ${
                    index === activeIndex
                      ? 'border-pink-500 ring-2 ring-pink-200'
                      : 'border-transparent hover:border-gray-300'
                  }
                `}
              >
                <img
                  src={image.url}
                  alt={image.altText || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {image.isPrimary && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-pink-600 text-white text-[9px] font-bold rounded-full">
                    MAIN
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImagePreview
          images={validImages}
          initialIndex={activeIndex}
          onClose={handleLightboxClose}
        />
      )}
    </>
  );
}

export default ImageGallery;
