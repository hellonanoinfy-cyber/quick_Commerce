'use client';

import {
  BarChart3,
  Boxes,
  Gift,
  Home,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

import useAuthStore from '@/stores/auth-store';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/coupons', label: 'Coupons', icon: Gift },
  { href: '/admin/banners', label: 'Banners', icon: ImagePlus },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/');
  }, [logout, router]);

  return (
    <>
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/60 shadow-2xl shadow-gray-900/5 transition-all duration-300 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-gray-100">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#C0185E] to-pink-600 shadow-lg shadow-pink-500/30">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-gray-900">FirstCry</span>
              <span className="ml-1 text-xs font-bold text-pink-600 uppercase tracking-wider">
                Admin
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {navItems.map(item => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-[#C0185E] to-pink-600 text-white shadow-lg shadow-pink-500/30'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-700'
                }`}
              >
                <item.icon
                  size={18}
                  className={active ? 'text-white' : 'text-gray-400 group-hover:text-pink-600'}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 p-3 space-y-2">
          <Link
            href="/"
            onClick={onClose}
            className="flex min-h-11 items-center gap-3 rounded-xl bg-gray-50/80 px-3 text-sm font-bold text-gray-600 hover:bg-pink-50 hover:text-pink-700 transition-colors"
          >
            <Home size={18} />
            Storefront
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex min-h-11 items-center gap-3 rounded-xl bg-red-50/80 px-3 text-sm font-bold text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* User Info */}
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C0185E] to-pink-600 text-sm font-black text-white shadow-lg">
              {(user?.name || user?.phoneNumber || 'A').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900">
                {user?.name || 'Admin User'}
              </p>
              <p className="truncate text-xs text-gray-500">{user?.role || 'Administrator'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
