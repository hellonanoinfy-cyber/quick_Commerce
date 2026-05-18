'use client';

import { PackageSearch } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';

const sampleOrders = [
  {
    id: 'demo-1001',
    orderNumber: 'MX-DEMO-1001',
    status: 'Delivered',
    totalAmount: 1299,
    createdAt: '2026-05-05T10:00:00.000Z',
  },
  {
    id: 'demo-1002',
    orderNumber: 'MX-DEMO-1002',
    status: 'Processing',
    totalAmount: 849,
    createdAt: '2026-05-08T10:00:00.000Z',
  },
];

export default function OrderHistory({ orders = sampleOrders }) {
  return (
    <section className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--brand-primary)]">
            Orders
          </p>
          <h2 className="text-2xl font-black text-gray-900">Order History</h2>
        </div>
        <Link
          href="/account/orders"
          className="inline-flex h-10 w-fit items-center justify-center rounded-full border border-gray-200 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {orders.map(order => (
          <article
            key={order.id}
            className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand-primary)]">
                <PackageSearch size={20} />
              </div>
              <div>
                <p className="font-black text-gray-900">{order.orderNumber}</p>
                <p className="text-xs font-bold text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                {order.status}
              </span>
              <span className="font-black text-gray-900">Rs. {order.totalAmount}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
