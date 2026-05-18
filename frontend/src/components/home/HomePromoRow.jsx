'use client';

import { Smartphone, Star } from 'lucide-react';
import Image from 'next/image';

import { HERO_IMAGES } from '@/lib/constants/media';

export default function HomePromoRow() {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-gradient-to-br from-[#F8E8FF] via-[var(--brand-light)] to-white p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--brand-mid)]/20"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-white shadow-lg sm:h-24 sm:w-24">
            <Image
              src={HERO_IMAGES.testimonial}
              alt="Parent testimonial"
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 sm:text-xl">Loved by Parents</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-gray-700 sm:text-base">
              &ldquo;MummaXpress has everything I need for my baby and delivers super fast! A true
              lifesaver for parents.&rdquo;
            </p>
            <p className="mt-3 text-xs font-bold text-gray-500">— Neha S., Bangalore</p>
            <div className="mt-2 flex gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[var(--brand-primary)] p-6 text-white sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-violet-200">
              Faster, Easier, Smarter
            </p>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">Download the MummaXpress App</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-lg bg-black px-4 py-2.5 text-left text-[10px] font-bold leading-tight text-white"
              >
                GET IT ON
                <br />
                <span className="text-xs">Google Play</span>
              </button>
              <button
                type="button"
                className="rounded-lg bg-black px-4 py-2.5 text-left text-[10px] font-bold leading-tight text-white"
              >
                Download on the
                <br />
                <span className="text-xs">App Store</span>
              </button>
            </div>
          </div>
          <div className="mx-auto flex h-32 w-28 items-center justify-center rounded-3xl bg-white/15 backdrop-blur sm:mx-0 sm:h-36 sm:w-32">
            <Smartphone size={52} strokeWidth={1.15} className="text-white/95 drop-shadow-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
