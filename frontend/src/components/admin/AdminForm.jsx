'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminForm({
  fields = [],
  values = {},
  onChange,
  onSubmit,
  submitLabel = 'Save',
}) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map(field => (
        <label key={field.name} className={field.wide ? 'sm:col-span-2' : ''}>
          <span className="mb-1 block px-2 text-xs font-black uppercase tracking-widest text-gray-400">
            {field.label}
          </span>
          <Input
            type={field.type || 'text'}
            name={field.name}
            value={values[field.name] || ''}
            onChange={onChange}
            placeholder={field.label}
            className="rounded-xl"
            required={field.required}
          />
        </label>
      ))}
      <div className="sm:col-span-2">
        <Button className="bg-[#C0185E] px-8">{submitLabel}</Button>
      </div>
    </form>
  );
}
