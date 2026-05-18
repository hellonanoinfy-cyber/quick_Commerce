'use client';

import { Baby, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import useAccountStore from '@/stores/account-store';

const emptyChild = { name: '', gender: '', dateOfBirth: '' };

const genderOptions = [
  { value: 'girl', label: 'Girl' },
  { value: 'boy', label: 'Boy' },
  { value: 'other', label: 'Prefer not to say' },
];

function formatAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const months =
    (new Date().getFullYear() - dob.getFullYear()) * 12 + (new Date().getMonth() - dob.getMonth());
  if (months < 12) return `${Math.max(months, 0)} mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} yr ${rem} mo` : `${years} yr`;
}

export default function MyLittleOne({ compact = false }) {
  const { children, addChild, updateChild, removeChild } = useAccountStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyChild);

  const reset = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyChild);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyChild);
    setOpen(true);
  };

  const openEdit = child => {
    setEditingId(child.id);
    setForm({
      name: child.name || '',
      gender: child.gender || '',
      dateOfBirth: child.dateOfBirth || '',
    });
    setOpen(true);
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (form.name.trim().length < 2) return;
    const payload = {
      name: form.name.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
    };
    if (editingId) {
      updateChild(editingId, payload);
    } else {
      addChild(payload);
    }
    reset();
  };

  return (
    <section
      className={`rounded-2xl border border-[var(--border-default)] bg-white shadow-sm ${
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'
      }`}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--brand-primary)]">
            My Little One
          </p>
          <h2 className="text-xl font-black text-gray-900 sm:text-2xl">
            Personalise picks for your child
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Add your little one&apos;s details for age-appropriate recommendations.
          </p>
        </div>
        <Button
          type="button"
          onClick={openAdd}
          className="h-10 w-fit rounded-full bg-[var(--brand-primary)] px-4 text-sm font-bold hover:bg-[var(--brand-primary-hover)]"
        >
          <Plus size={16} className="mr-1.5" />
          Add child
        </Button>
      </div>

      {children.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--brand-light)]/40 px-6 py-10 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[var(--brand-primary)] shadow-sm">
            <Baby size={28} />
          </div>
          <p className="font-black text-gray-900">No profiles yet</p>
          <p className="mt-1 max-w-sm text-sm font-medium text-gray-500">
            Tell us about your little one so we can surface the right sizes and essentials.
          </p>
          <Button
            type="button"
            onClick={openAdd}
            className="mt-5 rounded-full bg-[var(--brand-primary)] px-6 hover:bg-[var(--brand-primary-hover)]"
          >
            Add your first child
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {children.map(child => (
            <li
              key={child.id}
              className="flex gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--brand-light)]/30 p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--brand-primary)] shadow-sm">
                <Baby size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-black text-gray-900">{child.name}</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-gray-500">
                  {[child.gender, formatAge(child.dateOfBirth)].filter(Boolean).join(' · ') ||
                    'Details added'}
                </p>
                <div className="mt-3 flex gap-3 text-xs font-black uppercase tracking-widest">
                  <button
                    type="button"
                    onClick={() => openEdit(child)}
                    className="inline-flex items-center gap-1 text-[var(--brand-primary)]"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeChild(child.id)}
                    className="inline-flex items-center gap-1 text-red-600"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6"
            role="dialog"
            aria-labelledby="little-one-title"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="little-one-title" className="text-lg font-black text-gray-900">
                {editingId ? 'Edit profile' : 'Add your little one'}
              </h3>
              <button
                type="button"
                onClick={reset}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Child's name"
                className="h-12 rounded-xl"
                required
              />
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-gray-400">
                  Gender
                </p>
                <div className="flex flex-wrap gap-2">
                  {genderOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, gender: opt.value }))}
                      className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                        form.gender === opt.value
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-light)] text-[var(--brand-primary)]'
                          : 'border-gray-200 text-gray-600 hover:border-[var(--border-default)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
                  Date of birth
                </label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={e => setForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  className="flex-1 rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]"
                >
                  {editingId ? 'Save changes' : 'Add child'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
