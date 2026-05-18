'use client';

import { Tag, Package, User } from 'lucide-react';
import Link from 'next/link';

import CartIcon from '@/components/cart/CartIcon';
import AccountDropdown from '@/components/layout/header/AccountDropdown';
import useAuthStore from '@/stores/auth-store';

const navLinkClass =
  'hidden items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-[var(--brand-light)] hover:text-[var(--brand-primary)] sm:flex sm:text-sm';

export default function HeaderActions() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <Link href="/offers" className={navLinkClass}>
        <Tag size={18} />
        <span>Offers</span>
      </Link>
      <Link href="/account/orders" className={navLinkClass}>
        <Package size={18} />
        <span>Orders</span>
      </Link>
      {isAuthenticated ? (
        <div className="hidden sm:block">
          <AccountDropdown />
        </div>
      ) : (
        <Link href="/auth/login" className={navLinkClass}>
          <User size={18} />
          <span>Login</span>
        </Link>
      )}
      <div className="sm:hidden">
        <AccountDropdown />
      </div>
      <CartIcon />
    </div>
  );
}
