'use client';

import {
  BarChart3,
  LogIn,
  LogOut,
  Package,
  Heart,
  Settings,
  ShoppingCart,
  User,
  LayoutDashboard,
  PackageSearch,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';

import useAuthStore from '@/stores/auth-store';

// ===================================================
// CONSTANTS
// ===================================================

// Regular user menu items
const authenticatedItems = [
  { label: 'My Account', href: '/account', icon: User },
  { label: 'Orders', href: '/orders', icon: Package },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Cart', href: '/cart', icon: ShoppingCart },
];

// Admin menu items - only shown to admin users
const adminItems = [
  { label: 'Admin Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Manage Products', href: '/admin/products', icon: PackageSearch },
  { label: 'Manage Orders', href: '/admin/orders', icon: ClipboardList },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

// ===================================================
// HELPER FUNCTIONS
// ===================================================

/**
 * Normalize role for consistent comparison
 * Handles case sensitivity and different role formats
 */
const normalizeRole = role => {
  return (role || '').toLowerCase().trim();
};

/**
 * Check if user is admin using normalized role
 */
const checkIsAdmin = user => {
  if (!user) return false;
  const role = user.role || user.Role || '';
  return normalizeRole(role) === 'admin';
};

// ===================================================
// USER MENU COMPONENT
// ===================================================

export default function UserMenu({ isAuthenticated, onNavigate, onLogout }) {
  // MUST call useAuthStore at top level, unconditionally
  const { user } = useAuthStore();

  // Stable role check - consistent normalization
  const isAdmin = checkIsAdmin(user);

  // Early return for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="p-2">
        <Link
          href="/auth/login"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 hover:bg-[var(--brand-light)] hover:text-[var(--brand-primary)]"
        >
          <LogIn size={18} />
          Login/Register
        </Link>
      </div>
    );
  }

  return (
    <div className="p-2">
      {/* Regular User Menu Items */}
      {authenticatedItems.map(item => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 hover:bg-[var(--brand-light)] hover:text-[var(--brand-primary)]"
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}

      {/* Admin Section - Only shown for admin users */}
      {isAdmin && (
        <>
          {/* Divider */}
          <div className="my-2 border-t border-[var(--border-default)]" />

          {/* Admin Section Header */}
          <div className="px-4 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]">
              Admin Access
            </p>
          </div>

          {/* Admin Menu Items */}
          {adminItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[var(--brand-primary)] hover:bg-[var(--brand-light)] hover:text-[var(--brand-hover)]"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </>
      )}

      {/* Divider before logout */}
      <div className="my-2 border-t border-[var(--border-default)]" />

      {/* Logout Button */}
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
