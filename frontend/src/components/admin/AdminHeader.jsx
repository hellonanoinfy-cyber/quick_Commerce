'use client';

import { Bell, Menu, Search } from 'lucide-react';

import useAuthStore from '@/stores/auth-store';
import useNotificationStore from '@/stores/notification-store';

export default function AdminHeader({ title = 'Dashboard', onMenu }) {
  const { user } = useAuthStore();
  const unreadCount = useNotificationStore(state => state.unreadCount);

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-4 backdrop-blur lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenu}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-700 transition-colors hover:bg-pink-100 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-pink-600">
            Commerce Ops
          </p>
          <h1 className="truncate text-xl font-black text-gray-900 sm:text-2xl">{title}</h1>
        </div>
      </div>

      {/* Search Bar - Desktop */}
      <div className="hidden h-11 w-full max-w-md items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-4 transition-colors focus-within:border-pink-300 focus-within:bg-white lg:flex">
        <Search size={17} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search orders, products, customers..."
          className="flex-1 bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C0185E] text-[10px] font-black text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Admin Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C0185E] to-pink-600 text-sm font-black text-white shadow-lg shadow-pink-500/30">
          {(user?.name || user?.phoneNumber || 'A').slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
