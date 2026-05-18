'use client';

import { Search, SlidersHorizontal } from 'lucide-react';

export default function AdminFilters({ search, onSearchChange, children, title }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-4 transition-colors focus-within:border-pink-300 focus-within:bg-white">
        <Search size={17} className="text-gray-400" />
        <input
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          placeholder={title || 'Search...'}
          className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
        />
      </div>
      {children}
    </div>
  );
}
