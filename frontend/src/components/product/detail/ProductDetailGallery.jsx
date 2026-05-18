'use client';

import { useMemo, useState } from 'react';

import { ImagePreview } from '@/components/media/ImagePreview';
import { PRODUCT_IMAGE_FALLBACK } from '@/components/ui/ImageFallback';
import { ProductImage } from '@/components/ui/ProductImage';

export default function ProductDetailGallery({ images = [] }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const list = useMemo(() => {
    const safe = Array.isArray(images)
      ? images
          .filter(img => img?.url)
          .map(img => ({ url: img.url, altText: img.altText || 'Product' }))
      : [];
    return safe.length > 0 ? safe : [{ url: PRODUCT_IMAGE_FALLBACK, altText: 'Product' }];
  }, [images]);

  const activeImage = list[Math.min(active, list.length - 1)] || list[0];

  return (
    <>
      <div className="flex gap-3 sm:gap-4">
        {list.length > 1 && (
          <div className="hidden flex-col gap-2 sm:flex">
            {list.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition-all lg:h-[72px] lg:w-[72px] ${
                  i === active
                    ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-light)]'
                    : 'border-gray-200 hover:border-[var(--brand-mid)]'
                }`}
                aria-label={`View image ${i + 1}`}
                aria-pressed={i === active}
              >
                <ProductImage
                  src={img.url}
                  alt={img.altText}
                  fill
                  variant="thumb"
                  sizes="72px"
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-square min-h-[280px] flex-1 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-section)] p-4 sm:min-h-[360px] sm:p-6 lg:min-h-[420px]"
        >
          <ProductImage
            src={activeImage.url}
            alt={activeImage.altText}
            fill
            priority
            variant="product"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="cursor-zoom-in bg-white"
            imageClassName="object-contain"
          />
        </button>
      </div>

      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:hidden">
          {list.map((img, i) => (
            <button
              key={`mobile-${img.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-0.5 ${
                i === active ? 'border-[var(--brand-primary)]' : 'border-gray-200'
              }`}
            >
              <ProductImage src={img.url} alt="" fill sizes="56px" className="object-contain" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <ImagePreview
          images={list}
          initialIndex={active}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setActive}
        />
      )}
    </>
  );
}
