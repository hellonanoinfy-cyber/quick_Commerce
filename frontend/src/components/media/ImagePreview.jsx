'use client';

import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { SmartImage } from '@/components/ui/SmartImage';

/**
 * ImagePreview - Lightbox for image viewing
 *
 * @param {object} props
 * @param {Array} props.images - [{ id, url, altText }]
 * @param {number} props.initialIndex
 * @param {Function} props.onClose
 * @param {Function} props.onNavigate - callback(index)
 */
export function ImagePreview({ images = [], initialIndex = 0, onClose, onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const totalImages = images.length;
  const currentImage = images[currentIndex];

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    e => {
      switch (e.key) {
        case 'Escape':
          if (isZoomed) {
            setIsZoomed(false);
            setPosition({ x: 0, y: 0 });
          } else {
            onClose?.();
          }
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            onNavigate?.(newIndex);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < totalImages - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            onNavigate?.(newIndex);
          }
          break;
      }
    },
    [currentIndex, totalImages, isZoomed, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onNavigate?.(newIndex);
      resetZoom();
    }
  };

  const handleNext = () => {
    if (currentIndex < totalImages - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onNavigate?.(newIndex);
      resetZoom();
    }
  };

  const toggleZoom = () => {
    if (isZoomed) {
      setIsZoomed(false);
      setPosition({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
    }
  };

  const resetZoom = () => {
    setIsZoomed(false);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseMove = e => {
    if (!isZoomed) return;

    const container = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - container.left) / container.width - 0.5) * 100;
    const y = ((e.clientY - container.top) / container.height - 0.5) * 100;

    setPosition({ x: -x * 0.5, y: -y * 0.5 });
  };

  if (!currentImage?.url) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {currentIndex + 1} / {totalImages}
          </span>
          {currentImage.altText && (
            <span className="text-sm text-gray-300 truncate max-w-md">{currentImage.altText}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleZoom}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title={isZoomed ? 'Zoom out' : 'Zoom in'}
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div
        className={`
          flex-1 flex items-center justify-center p-8
          ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}
        `}
        onClick={isZoomed ? resetZoom : toggleZoom}
        onMouseMove={handleMouseMove}
      >
        <div
          className={`
            relative w-full h-full max-w-5xl max-h-[80vh]
            transition-transform duration-300 ease-out
            ${isZoomed ? 'cursor-move' : ''}
          `}
          style={
            isZoomed
              ? {
                  transform: `scale(1.5) translate(${position.x}px, ${position.y}px)`,
                }
              : {}
          }
        >
          <SmartImage
            src={currentImage.url}
            alt={currentImage.altText || 'Product image'}
            fill
            priority
            sizes="100vw"
            quality={90}
            className="object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      {totalImages > 1 && (
        <>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`
              absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20
              rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === totalImages - 1}
            className={`
              absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20
              rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Thumbnail Strip */}
      {totalImages > 1 && (
        <div className="flex items-center justify-center gap-2 p-4 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id || `thumb-${index}`}
              onClick={() => {
                setCurrentIndex(index);
                onNavigate?.(index);
                resetZoom();
              }}
              className={`
                flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                ${
                  index === currentIndex
                    ? 'border-pink-500 ring-2 ring-pink-400'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }
              `}
            >
              <img
                src={image.url}
                alt={image.altText || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImagePreview;
