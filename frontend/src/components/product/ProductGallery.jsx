'use client';

import { useMemo, useState } from 'react';

import { ImagePreview } from '@/components/media/ImagePreview';
import { ProductThumbnail } from '@/components/product/ProductThumbnail';
import { ProductZoom } from '@/components/product/ProductZoom';
import { PRODUCT_IMAGE_FALLBACK } from '@/components/ui/ImageFallback';
import { ProductImage } from '@/components/ui/ProductImage';

export function ProductGallery({ images }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const list = useMemo(() => {
    const safeImages = Array.isArray(images)
      ? images
          .filter(image => image?.url)
          .map(image => ({
            url: image.url,
            altText: image.altText || 'Product image',
          }))
      : [];

    return safeImages.length > 0
      ? safeImages
      : [{ url: PRODUCT_IMAGE_FALLBACK, altText: 'Product image' }];
  }, [images]);

  const activeImage = list[Math.min(active, list.length - 1)] || list[0];

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-6">
          <ProductZoom>
            <ProductImage
              src={activeImage.url}
              alt={activeImage.altText}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={70}
              className="h-full w-full object-contain mix-blend-multiply cursor-zoom-in"
              imageClassName="group-hover:scale-110 transition-transform duration-300"
              onClick={openLightbox}
            />
          </ProductZoom>
        </div>

        {list.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {list.map((img, i) => (
              <ProductThumbnail
                key={`${img.url}-${i}`}
                image={img}
                index={i}
                isActive={i === active}
                onSelect={setActive}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <ImagePreview
          images={list}
          initialIndex={active}
          onClose={closeLightbox}
          onNavigate={setActive}
        />
      )}
    </>
  );
}
