'use client';

export const PRODUCT_IMAGE_FALLBACK = '/images/product-placeholder.svg';

export const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

export function ImageFallback({ className = '' }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand-light)] via-white to-violet-50 ${className}`}
      aria-hidden="true"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-white text-[var(--brand-primary)] shadow-sm">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path
            d="M12 2a5 5 0 0 1 5 5c0 2.2-1.4 4.1-3.3 4.8L12 22l-1.7-10.2A5 5 0 0 1 12 2z"
            opacity="0.35"
          />
        </svg>
      </div>
    </div>
  );
}

export default ImageFallback;
