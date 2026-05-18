'use client';

export default function BrandFilter({ brands, currentBrand, updateFilters }) {
  const safeBrands = Array.isArray(brands) ? brands : [];

  return (
    <section className="space-y-3 border-b border-[var(--border-default)] pb-6">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Brand</h4>
      <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
        {safeBrands.map(brand => {
          const isActive = currentBrand === brand.slug;
          return (
            <button
              key={brand.id || brand.slug}
              type="button"
              onClick={() => updateFilters('brand', isActive ? null : brand.slug)}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-all ${
                isActive ? 'text-[var(--brand-primary)]' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
                  isActive
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]'
                    : 'border-gray-300'
                }`}
              >
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className="text-sm font-bold">{brand.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
