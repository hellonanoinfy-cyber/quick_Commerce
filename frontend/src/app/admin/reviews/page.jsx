'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import AdminPagination from '@/components/admin/AdminPagination';
import AdminTable from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/Button';
import { queryKeys } from '@/hooks/queries/query-keys';
import {
  getAdminReviews,
  updateAdminReviewStatus,
  deleteAdminReview,
} from '@/services/admin-service';

export default function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({ status: statusFilter, pageNumber: page, pageSize: 20 }),
    [page, statusFilter]
  );

  const {
    data: reviewPage,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.reviews(queryParams),
    queryFn: () => getAdminReviews(queryParams),
    retry: 1,
    staleTime: 30 * 1000,
  });

  const reviews = reviewPage?.items || [];
  const meta = reviewPage || { pageNumber: page, totalPages: 1 };

  const handleUpdateStatus = (id, status) => {
    updateAdminReviewStatus(id, status).then(() => refetch());
  };

  const handleDelete = id => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteAdminReview(id).then(() => refetch());
    }
  };

  const handleStatusFilterChange = event => {
    setPage(1);
    setStatusFilter(event.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <Button onClick={() => refetch()} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {isFetching && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
          Loading reviews...
        </p>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Reviews API failed: {error?.message || 'Unable to load reviews'}
        </div>
      )}

      <AdminTable
        rows={reviews}
        columns={[
          { key: 'productName', label: 'Product' },
          { key: 'customerName', label: 'Customer' },
          {
            key: 'rating',
            label: 'Rating',
            render: row => (
              <div className="flex text-amber-400">
                {'★'.repeat(row.rating)}
                {'☆'.repeat(5 - row.rating)}
              </div>
            ),
          },
          {
            key: 'comment',
            label: 'Review',
            render: row => (
              <div className="max-w-[300px]">
                <p className="truncate font-medium">{row.title}</p>
                <p className="truncate text-xs text-gray-500">{row.comment}</p>
              </div>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: row => (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  row.status === 'Approved'
                    ? 'bg-green-100 text-green-700'
                    : row.status === 'Rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                }`}
              >
                {row.status}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Moderation',
            render: row => (
              <div className="flex gap-2">
                {row.status !== 'Approved' && (
                  <button
                    onClick={() => handleUpdateStatus(row.id, 'Approved')}
                    className="text-xs font-black text-green-600"
                  >
                    Approve
                  </button>
                )}
                {row.status !== 'Rejected' && (
                  <button
                    onClick={() => handleUpdateStatus(row.id, 'Rejected')}
                    className="text-xs font-black text-red-600"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(row.id)}
                  className="text-xs font-black text-gray-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
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
