'use client';

import { Star } from 'lucide-react';

import { RATING_OPTIONS } from './filter-options';

export default function RatingFilter({ currentRating, updateFilters }) {
  return (
    <section className="space-y-4">
      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rating</h4>
      <div className="space-y-2">
        {RATING_OPTIONS.map(star => {
          const isActive = currentRating === star.toString();
          return (
            <button
              key={star}
              onClick={() => updateFilters('minRating', isActive ? null : star.toString())}
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
              <span className="flex items-center gap-1 text-sm font-bold">
                {star}+ <Star size={12} fill="currentColor" className="text-amber-400" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
