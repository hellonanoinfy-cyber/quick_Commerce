import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';

export async function updateProfile(payload) {
  const response = await api.put(API_ENDPOINTS.user.profile, payload);
  return response.data?.data || response.data;
}

export async function uploadProfilePhoto(file) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Profile photo upload failed');
    const data = await response.json();
    return data.secure_url;
  }

  return URL.createObjectURL(file);
}
