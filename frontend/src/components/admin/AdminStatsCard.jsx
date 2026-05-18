'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminStatsCard({
  label,
  value,
  icon: Icon,
  tone = 'text-pink-600 bg-pink-50',
  trend,
}) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
          {Icon && <Icon size={20} />}
        </div>
        {trend !== undefined && trend !== 0 && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
              isPositive
                ? 'bg-green-100 text-green-700'
                : isNegative
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={12} />
            ) : isNegative ? (
              <ArrowDownRight size={12} />
            ) : null}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-widest text-gray-400">{label}</p>
    </article>
  );
}
