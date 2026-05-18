'use client';

import { Camera } from 'lucide-react';

import { uploadProfilePhoto } from '@/services/account/profile-service';
import useAccountStore from '@/stores/account-store';

export default function ProfilePhotoUpload() {
  const { profilePhotoUrl, setProfilePhotoUrl } = useAccountStore();

  const handleUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await uploadProfilePhoto(file);
    setProfilePhotoUrl(url);
  };

  return (
    <label className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] ring-4 ring-white shadow-xl">
      {profilePhotoUrl ? (
        <img src={profilePhotoUrl} alt="Profile" className="h-full w-full object-cover" />
      ) : (
        <Camera size={30} />
      )}
      <input type="file" accept="image/*" onChange={handleUpload} className="sr-only" />
      <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] font-black text-white opacity-0 transition-opacity group-hover:opacity-100">
        UPDATE
      </span>
    </label>
  );
}
