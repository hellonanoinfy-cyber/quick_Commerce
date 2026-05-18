'use client';

import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl shadow-pink-100/50"
      >
        {/* Logo */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C0185E] to-pink-600 shadow-lg shadow-pink-500/30">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-pink-600">
          Admin Access Portal
        </p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">FirstCry Admin</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-gray-500">
          Secure admin access requires an authorized administrator account. Login with your admin
          credentials below.
        </p>

        <Link
          href="/auth/login?redirect=/admin/dashboard"
          className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C0185E] to-pink-600 px-8 text-sm font-black text-white shadow-lg shadow-pink-500/30 transition-transform hover:scale-[1.02]"
        >
          Login with OTP
        </Link>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secured with OTP authentication</span>
        </div>
      </motion.div>
    </main>
  );
}
