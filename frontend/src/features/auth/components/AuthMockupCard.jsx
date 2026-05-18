'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

import { BRAND_NAME } from '@/lib/constants/brand';
import { cn } from '@/lib/utils';

/** Centered auth card matching design screen 09 */
export default function AuthMockupCard({ children, defaultTab = 'login' }) {
  const [tab, setTab] = useState(defaultTab);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-section)] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E9DFFC] bg-white shadow-xl"
      >
        <div className="p-6 pb-0 sm:p-8 sm:pb-0">
          <h1 className="text-center text-xl font-black text-gray-900 sm:text-2xl">
            Welcome to <span className="text-[var(--brand-primary)]">{BRAND_NAME}</span>
          </h1>
          <p className="mt-1 text-center text-sm font-medium text-gray-500">
            Login / Sign up to continue
          </p>
          <div className="mt-6 flex rounded-xl bg-gray-100 p-1">
            {['login', 'signup'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'flex-1 rounded-lg py-2.5 text-sm font-bold capitalize transition',
                  tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                )}
              >
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6 pt-4 sm:p-8 sm:pt-5">{children}</div>
        <p className="px-6 pb-6 text-center text-[10px] font-medium text-gray-400 sm:px-8 sm:pb-8">
          By continuing, you agree to our{' '}
          <span className="text-[var(--brand-primary)]">Terms & Conditions</span> &{' '}
          <span className="text-[var(--brand-primary)]">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
}
