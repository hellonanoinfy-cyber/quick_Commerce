'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';

import AdminFilters from '@/components/admin/AdminFilters';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminTable from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/Button';
import { queryKeys } from '@/hooks/queries/query-keys';
import {
  getAdminInventory,
  getAdminInventoryAlerts,
  updateAdminStock,
} from '@/services/admin-service';

export default function AdminInventoryPage() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({ search: appliedSearch, status: statusFilter, pageNumber: page, pageSize: 20 }),
    [appliedSearch, page, statusFilter]
  );

  const {
    data: inventoryPage,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.inventory(queryParams),
    queryFn: () => getAdminInventory(queryParams),
    retry: 1,
    staleTime: 30 * 1000,
  });

  const {
    data: alerts = [],
    isFetching: alertsFetching,
    error: alertsError,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: queryKeys.admin.inventoryAlerts,
    queryFn: getAdminInventoryAlerts,
    retry: 1,
    staleTime: 30 * 1000,
  });

  const inventory = inventoryPage?.items || [];
  const meta = inventoryPage || { pageNumber: page, totalPages: 1 };

  const applyFilters = () => {
    setPage(1);
    setAppliedSearch(search);
  };

  const handleStatusChange = event => {
    setPage(1);
    setStatusFilter(event.target.value);
  };

  const handleStockUpdate = (productId, newStock) => {
    if (isNaN(newStock) || newStock < 0) return;
    updateAdminStock(productId, newStock).then(() => {
      refetch();
      refetchAlerts();
    });
  };

  return (
    <div className="space-y-6">
      {alerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-bold">Inventory Alerts ({alerts.length})</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {alerts.slice(0, 6).map(alert => (
              <div
                key={alert.productId}
                className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2 text-sm shadow-sm"
              >
                <span className="truncate font-medium text-gray-800">{alert.productName}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${alert.alertType === 'OutOfStock' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                >
                  {alert.currentStock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <AdminFilters search={search} onSearchChange={setSearch}>
            <Button onClick={applyFilters} variant="outline">
              Apply
            </Button>
          </AdminFilters>
          <select
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">All Statuses</option>
            <option value="Healthy">Healthy</option>
            <option value="LowStock">Low Stock</option>
            <option value="OutOfStock">Out of Stock</option>
          </select>
        </div>
      </div>

      {(isFetching || alertsFetching) && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
          Loading inventory...
        </p>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Inventory API failed: {error?.message || 'Unable to load inventory'}
        </div>
      )}
      {alertsError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Inventory alerts API failed: {alertsError?.message || 'Unable to load inventory alerts'}
        </div>
      )}

      <AdminTable
        rows={inventory}
        columns={[
          { key: 'productName', label: 'Product' },
          { key: 'sku', label: 'SKU' },
          { key: 'categoryName', label: 'Category' },
          {
            key: 'status',
            label: 'Status',
            render: row => (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  row.status === 'OutOfStock'
                    ? 'bg-red-100 text-red-700'
                    : row.status === 'LowStock'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                }`}
              >
                {row.status === 'OutOfStock'
                  ? 'Out of Stock'
                  : row.status === 'LowStock'
                    ? 'Low Stock'
                    : 'Healthy'}
              </span>
            ),
          },
          {
            key: 'adjust',
            label: 'Quick Adjust Stock',
            render: row => (
              <input
                defaultValue={row.currentStock}
                onBlur={event => handleStockUpdate(row.productId, Number(event.target.value))}
                className="h-9 w-24 rounded-full border border-gray-200 px-3 text-sm font-black focus:border-pink-500 focus:outline-none"
              />
            ),
          },
        ]}
      />
      <AdminPagination
        page={meta.pageNumber || page}
        totalPages={meta.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}
