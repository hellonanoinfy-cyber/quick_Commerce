'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// ===================================================
// ANALYTICS PAGE - MEMORY OPTIMIZED
// All chart components are dynamically imported
// to prevent heap overflow during compilation
// ===================================================

// Dynamic import wrapper for recharts chart components
// Each chart type loads only when rendered
const DynamicLineChart = dynamic(
  () =>
    import('recharts').then(mod => {
      const Component = ({ data, children }) => (
        <mod.LineChart data={data}>{children}</mod.LineChart>
      );
      return Component;
    }),
  {
    ssr: false,
    loading: () => <div className="h-80 w-full animate-pulse rounded-2xl bg-gray-100" />,
  }
);

const DynamicPieChart = dynamic(
  () =>
    import('recharts').then(mod => {
      const Component = ({ data, children }) => <mod.PieChart>{children}</mod.PieChart>;
      return Component;
    }),
  {
    ssr: false,
    loading: () => <div className="h-64 w-full animate-pulse rounded-2xl bg-gray-100" />,
  }
);

const DynamicBarChart = dynamic(
  () =>
    import('recharts').then(mod => {
      const Component = ({ data, layout, children }) => (
        <mod.BarChart data={data} layout={layout}>
          {children}
        </mod.BarChart>
      );
      return Component;
    }),
  {
    ssr: false,
    loading: () => <div className="h-64 w-full animate-pulse rounded-2xl bg-gray-100" />,
  }
);

const DynamicAreaChart = dynamic(
  () =>
    import('recharts').then(mod => {
      const Component = ({ data, children }) => (
        <mod.AreaChart data={data}>{children}</mod.AreaChart>
      );
      return Component;
    }),
  {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse rounded-2xl bg-gray-100" />,
  }
);

const DynamicResponsiveContainer = dynamic(
  () =>
    import('recharts').then(mod => {
      const Component = ({ width, height, children }) => (
        <mod.ResponsiveContainer width={width} height={height}>
          {children}
        </mod.ResponsiveContainer>
      );
      return Component;
    }),
  { ssr: false }
);

// Recharts static components (small footprint)
import { CartesianGrid, Legend, Tooltip, XAxis, YAxis, Line, Pie, Bar, Area, Cell } from 'recharts';

import { getAdminDashboard } from '@/services/admin-service';

// Demo analytics data
const REVENUE_DATA = [
  { month: 'Jan', revenue: 45000, orders: 120 },
  { month: 'Feb', revenue: 52000, orders: 145 },
  { month: 'Mar', revenue: 48000, orders: 132 },
  { month: 'Apr', revenue: 61000, orders: 168 },
  { month: 'May', revenue: 55000, orders: 152 },
  { month: 'Jun', revenue: 68000, orders: 189 },
  { month: 'Jul', revenue: 72000, orders: 201 },
  { month: 'Aug', revenue: 69000, orders: 195 },
  { month: 'Sep', revenue: 75000, orders: 210 },
  { month: 'Oct', revenue: 82000, orders: 230 },
  { month: 'Nov', revenue: 95000, orders: 265 },
  { month: 'Dec', revenue: 110000, orders: 305 },
];

const CATEGORY_DATA = [
  { name: 'Baby Care', value: 35, color: '#C0185E' },
  { name: 'Toys', value: 25, color: '#EC4899' },
  { name: 'Clothing', value: 20, color: '#F472B6' },
  { name: 'Feeding', value: 12, color: '#FB7185' },
  { name: 'Others', value: 8, color: '#FDA4AF' },
];

const TOP_PRODUCTS_DATA = [
  { name: 'Premium Diapers Pack', sales: 245, revenue: 49000, trend: '+12%' },
  { name: 'Baby Formula Stage 1', sales: 198, revenue: 39600, trend: '+8%' },
  { name: 'Soft Cotton Onesies', sales: 167, revenue: 25050, trend: '+15%' },
  { name: 'Baby Bottle Set', sales: 145, revenue: 17400, trend: '-3%' },
  { name: 'Rattle & Teether Kit', sales: 123, revenue: 12300, trend: '+22%' },
];

export default function AdminAnalyticsPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [period, setPeriod] = useState('year');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(setDashboardData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Custom tooltip styles
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-black text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Period Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-900">Analytics Overview</h2>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                period === p
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900">Revenue Trend</h3>
            <p className="text-sm font-medium text-gray-500">Monthly revenue comparison</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-pink-600" />
              <span className="text-sm font-medium text-gray-500">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm font-medium text-gray-500">Orders</span>
            </div>
          </div>
        </div>
        <div className="h-80 w-full">
          <DynamicResponsiveContainer width="100%" height="100%">
            <DynamicLineChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3E8EE" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 12, fontWeight: 700 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#C0185E"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </DynamicLineChart>
          </DynamicResponsiveContainer>
        </div>
      </motion.section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Distribution */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-5">
            <h3 className="text-lg font-black text-gray-900">Sales by Category</h3>
            <p className="text-sm font-medium text-gray-500">
              Distribution of sales across categories
            </p>
          </div>
          <div className="flex h-64 items-center justify-center">
            <DynamicResponsiveContainer width="100%" height="100%">
              <DynamicPieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </DynamicPieChart>
            </DynamicResponsiveContainer>
          </div>
        </motion.section>

        {/* Top Products Performance */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-5">
            <h3 className="text-lg font-black text-gray-900">Top Products</h3>
            <p className="text-sm font-medium text-gray-500">
              Best performing products this period
            </p>
          </div>
          <div className="h-64 w-full">
            <DynamicResponsiveContainer width="100%" height="100%">
              <DynamicBarChart data={TOP_PRODUCTS_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F3E8EE" />
                <XAxis type="number" tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" fill="#C0185E" radius={[0, 8, 8, 0]} />
              </DynamicBarChart>
            </DynamicResponsiveContainer>
          </div>
        </motion.section>
      </div>

      {/* Revenue Area Chart */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-5">
          <h3 className="text-lg font-black text-gray-900">Cumulative Revenue</h3>
          <p className="text-sm font-medium text-gray-500">Year-to-date revenue growth</p>
        </div>
        <div className="h-72 w-full">
          <DynamicResponsiveContainer width="100%" height="100%">
            <DynamicAreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C0185E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#C0185E" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3E8EE" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 12, fontWeight: 700 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C0185E"
                fill="url(#colorRevenue)"
                strokeWidth={3}
              />
            </DynamicAreaChart>
          </DynamicResponsiveContainer>
        </div>
      </motion.section>

      {/* Top Products Table */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4">
          <h3 className="text-lg font-black text-gray-900">Top Products Performance</h3>
          <p className="text-sm font-medium text-gray-500">
            Detailed breakdown of best-selling products
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500">
                  Product
                </th>
                <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500">
                  Sales
                </th>
                <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500">
                  Revenue
                </th>
                <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {TOP_PRODUCTS_DATA.map((product, index) => (
                <tr key={index} className="hover:bg-pink-50/40">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-xs font-black text-pink-600">
                        #{index + 1}
                      </div>
                      <span className="font-bold text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-700">{product.sales}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-900">
                    ₹{product.revenue?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {product.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </motion.div>
  );
}
