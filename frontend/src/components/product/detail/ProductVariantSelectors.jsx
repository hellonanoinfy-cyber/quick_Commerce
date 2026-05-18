'use client';

import { getProductVariantOptions } from '@/lib/catalog/product-variants';

function OptionGroup({ label, options, value, onChange }) {
  if (!options?.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(active ? null : opt)}
              className={`min-w-[44px] rounded-lg border-2 px-3 py-2 text-xs font-bold transition-all sm:text-sm ${
                active
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-light)] text-[var(--brand-primary)]'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-[var(--brand-mid)]'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductVariantSelectors({
  product,
  selectedSize,
  selectedPack,
  onSizeChange,
  onPackChange,
}) {
  const { sizes, packs } = getProductVariantOptions(product);

  if (!sizes.length && !packs.length) return null;

  return (
    <div className="space-y-6 border-b border-[var(--border-default)] pb-6">
      <OptionGroup
        label="Select size"
        options={sizes}
        value={selectedSize}
        onChange={onSizeChange}
      />
      <OptionGroup
        label="Select pack"
        options={packs}
        value={selectedPack}
        onChange={onPackChange}
      />
    </div>
  );
}
