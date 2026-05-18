'use client';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const fields = [
  ['fullName', 'Full name'],
  ['phone', 'Phone'],
  ['address', 'House / street address'],
  ['landmark', 'Landmark'],
  ['city', 'City'],
  ['state', 'State'],
  ['pincode', 'Pincode'],
];

export default function AddressModal({
  open,
  form,
  errors = {},
  editing,
  onChange,
  onSubmit,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-end bg-black/40 p-0 sm:items-center sm:p-4">
      <form
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl sm:mx-auto sm:max-w-2xl sm:rounded-[2rem] sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--brand-primary)]">
              Delivery
            </p>
            <h2 className="text-2xl font-black text-gray-900">
              {editing ? 'Edit Address' : 'Add Address'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500"
            aria-label="Close address modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map(([name, placeholder]) => (
            <label key={name} className={name === 'address' ? 'sm:col-span-2' : ''}>
              <Input
                name={name}
                value={form[name] || ''}
                onChange={onChange}
                placeholder={placeholder}
                className="rounded-xl"
              />
              {errors[name] && (
                <span className="mt-1 block px-2 text-xs font-bold text-red-600">
                  {errors[name]}
                </span>
              )}
            </label>
          ))}
          <select
            name="type"
            value={form.type || 'Home'}
            onChange={onChange}
            className="h-12 rounded-xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-700"
          >
            <option>Home</option>
            <option>Work</option>
            <option>Other</option>
          </select>
          <label className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 text-sm font-bold text-gray-600">
            <input
              type="checkbox"
              name="isDefault"
              checked={Boolean(form.isDefault)}
              onChange={onChange}
            />
            Make default
          </label>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-[var(--brand-primary)] px-8 hover:bg-[var(--brand-primary-hover)]">
            {editing ? 'Update' : 'Save'} Address
          </Button>
        </div>
      </form>
    </div>
  );
}
