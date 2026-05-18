'use client';

import {
  ChevronRight,
  Gift,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Package,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

import useAuthStore from '@/stores/auth-store';

const MENU_ITEMS = [
  { icon: Package, label: 'My Orders', href: '/account/orders' },
  { icon: MapPin, label: 'Saved Addresses', href: '/account' },
  { icon: Heart, label: 'Wishlist', href: '/wishlist' },
  { icon: Sparkles, label: 'MummaXpress Pass', href: '/pass' },
  { icon: HelpCircle, label: 'Help Center', href: '/help-center' },
  { icon: Gift, label: 'Contact Us', href: '/contact' },
];

export default function AccountMenuList({ onNavigate }) {
  const { logout } = useAuthStore();

  return (
    <nav className="overflow-hidden rounded-2xl border border-[#E9DFFC] bg-white shadow-sm">
      <ul className="divide-y divide-gray-100">
        {MENU_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={() => onNavigate?.(item.label)}
                className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-[var(--brand-light)]/50 sm:px-5 sm:py-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand-primary)]">
                  <Icon size={20} strokeWidth={2.25} />
                </span>
                <span className="flex-1 text-sm font-bold text-gray-900">{item.label}</span>
                <ChevronRight size={18} className="text-gray-300" />
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-red-50 sm:px-5 sm:py-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <LogOut size={20} strokeWidth={2.25} />
            </span>
            <span className="flex-1 text-sm font-bold text-red-600">Logout</span>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
