'use client';

import { Pencil, ShieldCheck } from 'lucide-react';

import ProfilePhotoUpload from '@/components/account/ProfilePhotoUpload';
import { Button } from '@/components/ui/Button';
import { BRAND_NAME } from '@/lib/constants/brand';

export default function ProfileHeader({ user, onEditProfile, isEditing = false }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-white shadow-sm">
      <div className="bg-gradient-to-r from-[var(--brand-primary)] via-violet-600 to-indigo-500 px-5 py-8 text-white sm:px-8">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/80">
          {BRAND_NAME} Member
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
          {user?.name || 'Welcome back'}
        </h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold text-white/85">
          Profile, your little ones, addresses, and payment preferences in one place.
        </p>
      </div>
      <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:px-8">
        <ProfilePhotoUpload />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-black text-gray-900">{user?.name || 'Customer'}</p>
          <p className="mt-1 text-sm font-bold text-gray-500">{user?.phoneNumber || user?.phone}</p>
          <p className="mt-1 truncate text-sm font-medium text-gray-400">
            {user?.email || 'Add an email for invoices and order updates'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-fit items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-green-700">
            <ShieldCheck size={16} />
            Verified
          </div>
          {onEditProfile && (
            <Button
              type="button"
              variant="outline"
              onClick={onEditProfile}
              className="h-10 rounded-full border-[var(--border-default)] px-4 text-sm font-bold"
            >
              <Pencil size={14} className="mr-1.5" />
              {isEditing ? 'Close editor' : 'Edit profile'}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
