'use client';

import { Smartphone } from 'lucide-react';

export default function HomeAppDownload() {
  return (
    <section className="overflow-hidden rounded-2xl bg-gray-900 px-6 py-8 text-white sm:px-10 sm:py-10">
      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="text-center md:text-left">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">
            Get the app
          </p>
          <h2 className="text-xl font-black sm:text-2xl">Download the MummaXpress App</h2>
          <p className="mt-2 max-w-md text-sm text-gray-400">
            Track orders, get exclusive offers, and reorder in one tap.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
            <button
              type="button"
              className="rounded-lg bg-white px-4 py-2 text-xs font-black text-gray-900"
            >
              Google Play
            </button>
            <button
              type="button"
              className="rounded-lg border border-gray-600 px-4 py-2 text-xs font-black text-white"
            >
              App Store
            </button>
          </div>
        </div>
        <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-violet-600/30 text-violet-200">
          <Smartphone size={56} strokeWidth={1.25} />
        </div>
      </div>
    </section>
  );
}
