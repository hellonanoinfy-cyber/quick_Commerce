'use client';

export default function AddressCard({ address, onEdit, onDelete, onDefault }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-100/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-gray-900">{address.fullName}</h3>
            {address.isDefault && (
              <span className="rounded-full bg-[var(--brand-light)] px-2 py-0.5 text-[10px] font-black text-[var(--brand-primary)]">
                DEFAULT
              </span>
            )}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-black text-gray-500">
              {address.type || 'Home'}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
            {address.address}
            {address.landmark ? `, ${address.landmark}` : ''}, {address.city}, {address.state} -{' '}
            {address.pincode}
          </p>
          <p className="mt-1 text-sm font-bold text-gray-700">{address.phone}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs font-black uppercase tracking-widest">
        <button onClick={onEdit} className="text-[var(--brand-primary)]">
          Edit
        </button>
        <button onClick={onDelete} className="text-red-600">
          Delete
        </button>
        {!address.isDefault && (
          <button onClick={onDefault} className="text-gray-500">
            Set Default
          </button>
        )}
      </div>
    </article>
  );
}
