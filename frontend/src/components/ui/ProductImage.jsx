'use client';

import { SmartImage } from '@/components/ui/SmartImage';

export function ProductImage({ variant = 'product', ...props }) {
  return <SmartImage variant={variant} {...props} />;
}

export default ProductImage;
