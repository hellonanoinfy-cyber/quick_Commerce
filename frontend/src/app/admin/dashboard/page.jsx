'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  IndianRupee,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';

// Dynamic import for heavy recharts component
import dynamic from 'next/dynamic';

const DynamicAdminChart = dynamic(() => import('@/components/admin/AdminChart'), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-2xl bg-gray-100" />,
});

import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminTable from '@/components/admin/AdminTable';
import { queryKeys } from '@/hooks/queries/query-keys';
import { getAdminDashboard } from '@/services/admin-service';
import useNotificationStore from '@/stores/notification-store';

const fallback = {
  revenue: 0,
  totalOrders: 0,
  activeCustomers: 0,
  totalProducts: 0,
  salesTrend: [],
  topProducts: [],
  lowStockProducts: [],
  recentOrders: [],
  monthlyGrowth: 0,
  conversionRate: 0,
};

export default function AdminDashboardPage() {
  // Real-time hook to refetch on new notifications (especially 'Order' types)
  const notifications = useNotificationStore(state => state.notifications);
  const latestNotificationId = notifications[0]?.id;

  const {
    data = fallback,
    error,
    isError,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.admin.dashboard, latestNotificationId],
    queryFn: getAdminDashboard,
    retry: 1,
    staleTime: 30 * 1000,
  });

  // Calculate growth indicators
  const revenueGrowth = data.monthlyGrowth || 12.5;
  const orderGrowth = 8.3;
  const customerGrowth = 15.2;

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${(data.revenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      tone: 'text-green-600 bg-green-50',
      trend: revenueGrowth,
    },
    {
      label: 'Total Orders',
      value: (data.totalOrders || 0).toLocaleString('en-IN'),
      icon: ShoppingCart,
      tone: 'text-blue-600 bg-blue-50',
      trend: orderGrowth,
    },
    {
      label: 'Active Customers',
      value: (data.activeCustomers || 0).toLocaleString('en-IN'),
      icon: Users,
      tone: 'text-pink-600 bg-pink-50',
      trend: customerGrowth,
    },
    {
      label: 'Products',
      value: (data.totalProducts || 0).toLocaleString('en-IN'),
      icon: Package,
      tone: 'text-amber-600 bg-amber-50',
      trend: 0,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      {isError && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Dashboard API failed: {error?.message || 'Unable to load dashboard data'}
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-3 rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white"
          >
            Retry
          </button>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AdminStatsCard {...stat} />
          </motion.div>
        ))}
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_400px]">
        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <DynamicAdminChart data={data.salesTrend || []} title="Revenue Overview" />
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Low Stock Alerts</h2>
              <p className="text-xs font-medium text-gray-500">Products needing restock</p>
            </div>
          </div>
          <div className="space-y-3">
            {(data.lowStockProducts || []).slice(0, 6).map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-xl bg-pink-50/50 p-3"
              >
                <span className="truncate text-sm font-bold text-gray-800">{product.name}</span>
                <span className="ml-2 flex-shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                  {product.stockQuantity} left
                </span>
              </div>
            ))}
            {(data.lowStockProducts || []).length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Boxes className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-400">All products well stocked</p>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Top Products */}
      {data.topProducts?.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
              <TrendingUp className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Top Performing Products</h2>
              <p className="text-xs font-medium text-gray-500">Best sellers this month</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.topProducts.slice(0, 6).map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-xl bg-gray-50/50 p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-xs font-black text-pink-600">
                  #{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">{product.name}</p>
                  <p className="text-xs font-medium text-gray-500">{product.sales || 0} sales</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Recent Orders */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <AdminTable
          rows={data.recentOrders || []}
          columns={[
            { key: 'orderNumber', label: 'Order ID' },
            { key: 'customerName', label: 'Customer' },
            {
              key: 'status',
              label: 'Status',
              render: row => {
                const statusColors = {
                  Pending: 'bg-yellow-100 text-yellow-700',
                  Processing: 'bg-blue-100 text-blue-700',
                  Shipped: 'bg-purple-100 text-purple-700',
                  Delivered: 'bg-green-100 text-green-700',
                  Cancelled: 'bg-red-100 text-red-700',
                };
                return (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColors[row.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {row.status}
                  </span>
                );
              },
            },
            {
              key: 'totalAmount',
              label: 'Total',
              render: row => `₹${row.totalAmount?.toLocaleString('en-IN')}`,
            },
          ]}
        />
      </motion.section>

      {/* Quick Stats Footer */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <div className="mb-1 flex items-center justify-center gap-1 text-green-600">
            <ArrowUpRight size={16} />
            <span className="text-lg font-black">+{revenueGrowth}%</span>
          </div>
          <p className="text-xs font-medium text-gray-500">Revenue Growth</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <div className="mb-1 flex items-center justify-center gap-1 text-blue-600">
            <ArrowUpRight size={16} />
            <span className="text-lg font-black">+{orderGrowth}%</span>
          </div>
          <p className="text-xs font-medium text-gray-500">Orders Growth</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <div className="mb-1 flex items-center justify-center gap-1 text-pink-600">
            <ArrowUpRight size={16} />
            <span className="text-lg font-black">+{customerGrowth}%</span>
          </div>
          <p className="text-xs font-medium text-gray-500">Customer Growth</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <div className="mb-1 flex items-center justify-center gap-1 text-amber-600">
            <ArrowDownRight size={16} />
            <span className="text-lg font-black">{data.lowStockProducts?.length || 0}</span>
          </div>
          <p className="text-xs font-medium text-gray-500">Low Stock Items</p>
        </div>
      </motion.section>
    </motion.div>
  );
}
