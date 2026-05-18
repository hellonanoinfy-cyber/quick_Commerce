'use client';

import { AVAILABILITY_OPTIONS } from './filter-options';

export default function StockFeatureFilter({ searchParams, updateFilters }) {
  return (
    <section className="space-y-4">
      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        Availability
      </h4>
      <div className="space-y-2">
        {AVAILABILITY_OPTIONS.map(option => {
          const isActive = searchParams.get(option.key) === option.value;
          return (
            <button
              key={option.key}
              onClick={() => updateFilters(option.key, isActive ? null : option.value)}
              className={`flex items-center gap-3 w-full text-left transition-all ${
                isActive ? 'text-[var(--brand-primary)]' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                  isActive
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]'
                    : 'border-gray-300'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
              </span>
              <span className="text-sm font-bold">{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
