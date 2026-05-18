import Image from 'next/image';
import Link from 'next/link';

import { BRAND_LOGO_ALT, BRAND_LOGO_SRC, BRAND_NAME } from '@/lib/constants/brand';

/** Full circular MummaXpress logo (2048×2048 master). */
const LOGO_INTRINSIC = { w: 2048, h: 2048 };

const SIZE_MAP = {
  sm: {
    mark: 'h-10 w-10 sm:h-11 sm:w-11',
    text: 'text-base sm:text-lg',
  },
  md: {
    mark: 'h-12 w-12 sm:h-14 sm:w-14',
    text: 'text-lg sm:text-xl',
  },
  lg: {
    mark: 'h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]',
    text: 'text-xl sm:text-2xl',
  },
};

/** Circular logo mark + MummaXpress wordmark (header). */
export default function BrandLogo({ className = '', showText = true, size = 'md', href = '/' }) {
  const dims = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <Link
      href={href}
      className={`flex shrink-0 items-center gap-1.5 text-[var(--brand-primary)] ${className}`}
      aria-label={`${BRAND_NAME} home`}
    >
      <Image
        src={BRAND_LOGO_SRC}
        alt={BRAND_LOGO_ALT}
        width={LOGO_INTRINSIC.w}
        height={LOGO_INTRINSIC.h}
        quality={100}
        priority
        unoptimized
        sizes="(max-width: 1024px) 44px, 56px"
        className={`shrink-0 object-contain ${dims.mark}`}
      />
      {showText && (
        <span
          className={`-ml-0.5 shrink-0 whitespace-nowrap font-black leading-none tracking-tight ${dims.text}`}
        >
          {BRAND_NAME}
        </span>
      )}
    </Link>
  );
}
