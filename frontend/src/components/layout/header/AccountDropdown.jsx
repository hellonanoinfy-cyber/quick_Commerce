'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import UserMenu from '@/components/layout/header/UserMenu';
import { BRAND_NAME } from '@/lib/constants/brand';
import useAuthStore from '@/stores/auth-store';

export default function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = event => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const label = isAuthenticated ? user?.name || 'Account' : 'Login / Sign up';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(open => !open)}
        className="flex max-w-[11rem] items-center gap-2 rounded-full p-1.5 pr-2 text-gray-700 transition-colors hover:bg-[var(--brand-light)] hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-mid)] sm:pr-3"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)]">
          <UserIcon size={18} />
        </span>
        <span className="hidden min-w-0 flex-col items-start leading-none md:flex">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Account
          </span>
          <span className="max-w-[7.5rem] truncate text-[13px] font-bold">{label}</span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full z-[1100] mt-3 w-72 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-white shadow-2xl shadow-violet-100/80"
          >
            <div className="border-b border-[var(--border-default)] bg-[var(--brand-light)]/50 px-5 py-4">
              <p className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]">
                {isAuthenticated ? 'Welcome back' : BRAND_NAME}
              </p>
              <p className="mt-1 truncate text-sm font-bold text-gray-800">
                {isAuthenticated
                  ? user?.name || user?.phoneNumber || 'Customer'
                  : 'Login for faster checkout'}
              </p>
              {!isAuthenticated && (
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl bg-[var(--brand-primary)] text-xs font-black text-white hover:bg-[var(--brand-hover)]"
                >
                  Login / Sign up
                </Link>
              )}
            </div>
            <UserMenu
              isAuthenticated={isAuthenticated}
              onNavigate={() => setIsOpen(false)}
              onLogout={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
