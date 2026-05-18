'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import { BLUR_PLACEHOLDER, PRODUCT_IMAGE_FALLBACK } from '@/components/ui/ImageFallback';
import { DEFAULT_PRODUCT_IMAGE, getProductImageFallback } from '@/lib/constants/media';

const ALLOWED_REMOTE_HOSTS = new Set(['images.unsplash.com', 'res.cloudinary.com', 'placehold.co']);

const VARIANT_PRESETS = {
  thumb: { maxWidth: 256, quality: 70 },
  product: { maxWidth: 900, quality: 85 },
  hero: { maxWidth: 1400, quality: 85 },
};

function isAllowedRemoteHost(hostname) {
  return (
    ALLOWED_REMOTE_HOSTS.has(hostname) ||
    hostname.endsWith('.amazonaws.com') ||
    hostname.endsWith('.cloudfront.net') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  );
}

function normalizeImageSource(src, variant = 'product') {
  if (!src || typeof src !== 'string') return PRODUCT_IMAGE_FALLBACK;
  if (src.startsWith('/')) return src;

  const { maxWidth, quality: maxQuality } = VARIANT_PRESETS[variant] || VARIANT_PRESETS.product;

  try {
    const url = new URL(src);
    if (!isAllowedRemoteHost(url.hostname)) {
      return PRODUCT_IMAGE_FALLBACK;
    }

    if (url.hostname === 'images.unsplash.com') {
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', url.searchParams.get('fit') || 'crop');
      const existingW = Number(url.searchParams.get('w')) || 0;
      const targetW = Math.max(existingW, maxWidth);
      url.searchParams.set('w', String(Math.min(targetW, 1400)));
      const existingQ = Number(url.searchParams.get('q')) || 0;
      url.searchParams.set('q', String(Math.max(existingQ, maxQuality)));
    }

    return url.toString();
  } catch {
    return PRODUCT_IMAGE_FALLBACK;
  }
}

/** Layout-only classes for the wrapper (never object-fit / blend). */
function splitLayoutClasses(className = '') {
  const tokens = className.split(/\s+/).filter(Boolean);
  const layout = [];
  const image = [];

  for (const token of tokens) {
    if (
      token.startsWith('object-') ||
      token.startsWith('mix-blend-') ||
      token === 'transition-transform' ||
      token.startsWith('duration-') ||
      token.startsWith('group-hover:')
    ) {
      image.push(token);
    } else {
      layout.push(token);
    }
  }

  return { layout: layout.join(' '), image: image.join(' ') };
}

export function SmartImage({
  src,
  alt,
  categorySlug,
  fill = false,
  width = 400,
  height = 400,
  priority = false,
  className = '',
  imageClassName = '',
  sizes = '100vw',
  quality,
  variant = 'product',
}) {
  const preset = VARIANT_PRESETS[variant] || VARIANT_PRESETS.product;
  const resolvedQuality = quality ?? preset.quality;
  const safeSrc = useMemo(() => normalizeImageSource(src, variant), [src, variant]);
  const remoteFallback = useMemo(
    () =>
      normalizeImageSource(getProductImageFallback(categorySlug) || DEFAULT_PRODUCT_IMAGE, variant),
    [categorySlug, variant]
  );
  const [failedSrc, setFailedSrc] = useState(null);
  const imgSrc =
    failedSrc === safeSrc
      ? safeSrc.startsWith('http')
        ? remoteFallback
        : PRODUCT_IMAGE_FALLBACK
      : safeSrc;

  const { layout: layoutFromClass, image: imageFromClass } = splitLayoutClasses(className);
  const objectFitClass = `${imageFromClass} ${imageClassName}`.includes('object-cover')
    ? 'object-cover'
    : `${imageFromClass} ${imageClassName}`.includes('object-fill')
      ? 'object-fill'
      : 'object-contain';
  const blendClass =
    className.includes('mix-blend-multiply') || imageClassName.includes('mix-blend-multiply')
      ? 'mix-blend-multiply'
      : '';

  const isLocal = imgSrc.startsWith('/');
  const wrapperClass = [
    'overflow-hidden',
    fill ? 'absolute inset-0 h-full w-full' : 'relative block h-full w-full',
    layoutFromClass || 'bg-[var(--bg-section)]',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass}>
      <Image
        key={imgSrc}
        src={imgSrc}
        alt={alt || 'Product image'}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
        quality={resolvedQuality}
        placeholder={isLocal ? 'blur' : 'empty'}
        blurDataURL={isLocal ? BLUR_PLACEHOLDER : undefined}
        className={`${objectFitClass} ${blendClass} ${imageFromClass} ${imageClassName} transition-transform duration-500 ease-out`.trim()}
        onError={() => {
          if (imgSrc !== PRODUCT_IMAGE_FALLBACK && imgSrc !== remoteFallback) {
            setFailedSrc(safeSrc);
          }
        }}
      />
    </div>
  );
}

export default SmartImage;
