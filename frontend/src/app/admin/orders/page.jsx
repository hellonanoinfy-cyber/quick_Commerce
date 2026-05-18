'use client';

import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { useMemo, useState } from 'react';

import AdminFilters from '@/components/admin/AdminFilters';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminTable from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/Button';
import { queryKeys } from '@/hooks/queries/query-keys';
import { getAdminOrders, updateAdminOrderStatus } from '@/services/admin-service';

const ORDER_STATUSES = [
  { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  { value: 'Processing', label: 'Processing', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'Shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  { value: 'Delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  { value: 'Refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
];

const PAYMENT_STATUSES = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
  Refunded: 'bg-gray-100 text-gray-700',
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const queryParams = useMemo(
    () => ({ search: appliedSearch, pageNumber: page, pageSize: 20 }),
    [appliedSearch, page]
  );

  const {
    data: orderPage,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.orders(queryParams),
    queryFn: () => getAdminOrders(queryParams),
    retry: 1,
    staleTime: 30 * 1000,
  });

  const orders = orderPage?.items || [];
  const meta = orderPage || { pageNumber: page, totalPages: 1 };

  const applyFilters = () => {
    setPage(1);
    setAppliedSearch(search);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await updateAdminOrderStatus(orderId, newStatus, 'Updated by admin');
    refetch();
  };

  const getStatusColor = status => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <AdminFilters search={search} onSearchChange={setSearch} title="Search orders...">
        <Button onClick={applyFilters} variant="outline" size="sm">
          Apply
        </Button>
      </AdminFilters>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-black text-yellow-600">
            {orders.filter(o => o.status === 'Pending').length}
          </p>
          <p className="text-xs font-medium text-gray-500">Pending</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-black text-indigo-600">
            {orders.filter(o => o.status === 'Processing').length}
          </p>
          <p className="text-xs font-medium text-gray-500">Processing</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-black text-purple-600">
            {orders.filter(o => o.status === 'Shipped').length}
          </p>
          <p className="text-xs font-medium text-gray-500">Shipped</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-black text-green-600">
            {orders.filter(o => o.status === 'Delivered').length}
          </p>
          <p className="text-xs font-medium text-gray-500">Delivered</p>
        </div>
      </div>

      {isFetching && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
          Loading orders...
        </p>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Orders API failed: {error?.message || 'Unable to load orders'}
        </div>
      )}

      {/* Orders Table */}
      <AdminTable
        rows={orders}
        columns={[
          {
            key: 'orderNumber',
            label: 'Order ID',
            render: row => <span className="font-black text-pink-600">{row.orderNumber}</span>,
          },
          {
            key: 'customerName',
            label: 'Customer',
            render: row => (
              <div>
                <p className="font-bold text-gray-900">{row.customerName || 'Guest'}</p>
                <p className="text-xs text-gray-500">{row.customerPhone}</p>
              </div>
            ),
          },
          {
            key: 'items',
            label: 'Items',
            render: row => (
              <span className="text-sm">{row.itemCount ?? row.items?.length ?? 0} items</span>
            ),
          },
          {
            key: 'totalAmount',
            label: 'Total',
            render: row => (
              <span className="font-black text-gray-900">
                ₹{row.totalAmount?.toLocaleString('en-IN')}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: row => (
              <select
                value={row.status}
                onChange={event => handleStatusChange(row.id, event.target.value)}
                className={`h-8 rounded-lg border-0 px-3 text-xs font-bold ${getStatusColor(row.status)}`}
              >
                {ORDER_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            ),
          },
          {
            key: 'paymentStatus',
            label: 'Payment',
            render: row => (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${PAYMENT_STATUSES[row.paymentStatus] || 'bg-gray-100 text-gray-700'}`}
              >
                {row.paymentStatus || 'Pending'}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: row => (
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(row)}>
                <Eye size={14} />
              </Button>
            ),
          },
        ]}
      />
      <AdminPagination
        page={meta.pageNumber || page}
        totalPages={meta.totalPages || 1}
        onPageChange={setPage}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-[1200] flex items-center bg-black/40 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  Order {selectedOrder.orderNumber}
                </h2>
                <p className="text-sm text-gray-500">
                  Placed on{' '}
                  {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Status Timeline */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-gray-400">
                Order Status
              </h3>
              <div className="flex items-center gap-2">
                {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map(
                  (status, index) => {
                    const currentIndex = ORDER_STATUSES.findIndex(
                      s => s.value === selectedOrder.status
                    );
                    const statusIndex = ORDER_STATUSES.findIndex(s => s.value === status);
                    const isActive = statusIndex <= currentIndex;
                    const isCurrent = status === selectedOrder.status;

                    return (
                      <div key={status} className="flex flex-1 items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                            isActive ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-pink-200' : ''}`}
                        >
                          {index + 1}
                        </div>
                        {index < 4 && (
                          <div
                            className={`flex-1 h-0.5 ${isActive && statusIndex < currentIndex ? 'bg-pink-600' : 'bg-gray-200'}`}
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>
              <div className="mt-2 flex justify-between text-xs font-medium text-gray-500">
                <span>Pending</span>
                <span>Confirmed</span>
                <span>Processing</span>
                <span>Shipped</span>
                <span>Delivered</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
              <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-gray-400">
                Customer Details
              </h3>
              <p className="font-bold text-gray-900">
                {selectedOrder.customerName || 'Guest Customer'}
              </p>
              <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
              {selectedOrder.shippingAddress && (
                <p className="mt-2 text-sm text-gray-500">{selectedOrder.shippingAddress}</p>
              )}
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-gray-400">
                Order Items
              </h3>
              <div className="space-y-3">
                {(selectedOrder.items || []).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl bg-gray-50/50 p-3"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-black text-gray-900">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">
                  ₹{selectedOrder.subTotal?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-bold">₹{selectedOrder.shippingCost || 0}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">
                <span className="text-lg font-black text-gray-900">Total</span>
                <span className="text-lg font-black text-pink-600">
                  ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
