'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function AdminChart({ data = [], type = 'area', title = 'Sales Trend' }) {
  const Chart = type === 'bar' ? BarChart : AreaChart;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-xl font-black text-gray-900">{title}</h2>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data}>
            <defs>
              <linearGradient id="adminPink" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C0185E" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#C0185E" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3E8EE" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 700 }} />
            <YAxis tick={{ fontSize: 12, fontWeight: 700 }} />
            <Tooltip />
            {type === 'bar' ? (
              <Bar dataKey="value" fill="#C0185E" radius={[8, 8, 0, 0]} />
            ) : (
              <Area
                type="monotone"
                dataKey="value"
                stroke="#C0185E"
                fill="url(#adminPink)"
                strokeWidth={3}
              />
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
