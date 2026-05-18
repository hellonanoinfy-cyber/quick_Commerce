'use client';

import { Quote, Star } from 'lucide-react';

export default function HomeTestimonial() {
  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-gradient-to-r from-[var(--brand-light)] to-white p-6 sm:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]">
            Loved by Parents
          </p>
          <Quote className="mb-3 text-[var(--brand-mid)]" size={28} />
          <p className="text-base font-medium leading-relaxed text-gray-700 sm:text-lg">
            &ldquo;MummaXpress saved us on late-night diaper runs. Delivery is fast and products are
            always genuine.&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary)] text-sm font-black text-white">
              PS
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">Priya Sharma</p>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={12} fill="currentColor" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
