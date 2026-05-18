'use client';

import { PRICE_RANGES } from './filter-options';

export default function PriceFilter({ currentPrice, updateFilters }) {
  return (
    <section className="space-y-3 border-b border-[var(--border-default)] pb-6">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        Price Range
      </h4>
      <div className="space-y-1">
        {PRICE_RANGES.map(range => {
          const isActive = currentPrice === range.value;
          return (
            <button
              key={range.value}
              type="button"
              onClick={() => updateFilters('priceRange', isActive ? null : range.value)}
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
              <span className="text-sm font-bold">{range.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
