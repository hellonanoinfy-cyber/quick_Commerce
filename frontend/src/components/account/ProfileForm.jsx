'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateProfile } from '@/services/account/profile-service';
import useAuthStore from '@/stores/auth-store';

export default function ProfileForm({ onSaved }) {
  const { user, updateUser, isAuthenticated } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    gender: user?.gender || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phoneNumber || user?.phone || '',
      gender: user?.gender || '',
    });
  }, [user]);

  const handleChange = event => {
    setForm(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    if (form.name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSaving(true);
    try {
      if (isAuthenticated) {
        const updated = await updateProfile({
          name: form.name,
          email: form.email,
          profileCompleted: Boolean(form.name),
        });
        updateUser(updated);
      } else {
        updateUser(form);
      }
      onSaved?.();
    } catch (profileError) {
      setError(profileError.message || 'Unable to save profile right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        ['name', 'Full name'],
        ['phone', 'Phone number'],
        ['email', 'Email address'],
        ['gender', 'Gender'],
      ].map(([name, placeholder]) => (
        <Input
          key={name}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={name === 'phone'}
          className="h-12 rounded-xl"
        />
      ))}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 md:col-span-2">
          {error}
        </p>
      )}
      <div className="md:col-span-2">
        <Button
          disabled={saving}
          className="rounded-full bg-[var(--brand-primary)] px-8 hover:bg-[var(--brand-primary-hover)]"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
