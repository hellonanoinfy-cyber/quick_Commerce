'use client';

import { X } from 'lucide-react';

export default function AdminModal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-end bg-black/40 p-0 sm:items-center sm:p-4">
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl sm:mx-auto sm:max-w-3xl sm:rounded-[2rem] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
