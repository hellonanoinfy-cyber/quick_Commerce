'use client';

import { useQuery } from '@tanstack/react-query';
import { Ban, CheckCircle, Eye } from 'lucide-react';
import { useMemo, useState } from 'react';

import AdminFilters from '@/components/admin/AdminFilters';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminTable from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/Button';
import { queryKeys } from '@/hooks/queries/query-keys';
import { getAdminCustomers, setAdminCustomerBlocked } from '@/services/admin-service';

const isAdminRole = role => String(role || '').toLowerCase() === 'admin';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const queryParams = useMemo(
    () => ({ search: appliedSearch, pageNumber: page, pageSize: 20 }),
    [appliedSearch, page]
  );

  const {
    data: customerPage,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.customers(queryParams),
    queryFn: () => getAdminCustomers(queryParams),
    retry: 1,
    staleTime: 30 * 1000,
  });

  const customers = customerPage?.items || [];
  const meta = customerPage || { pageNumber: page, totalPages: 1 };

  const applyFilters = () => {
    setPage(1);
    setAppliedSearch(search);
  };

  const handleBlockToggle = async (customerId, currentlyBlocked) => {
    await setAdminCustomerBlocked(customerId, !currentlyBlocked);
    refetch();
  };

  const getRoleBadge = role => {
    if (isAdminRole(role)) {
      return (
        <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
          Admin
        </span>
      );
    }
    return (
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
        Customer
      </span>
    );
  };

  // Stats
  const stats = {
    total: customers.length,
    admins: customers.filter(c => isAdminRole(c.role)).length,
    blocked: customers.filter(c => c.isBlocked).length,
    completed: customers.filter(c => c.profileCompleted).length,
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-black text-gray-900">{meta.totalCount || 0}</p>
          <p className="text-xs font-medium text-gray-500">Total Customers</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-black text-purple-600">{stats.admins}</p>
          <p className="text-xs font-medium text-gray-500">Admins</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-black text-green-600">{stats.completed}</p>
          <p className="text-xs font-medium text-gray-500">Profiles Complete</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-black text-red-600">{stats.blocked}</p>
          <p className="text-xs font-medium text-gray-500">Blocked</p>
        </div>
      </div>

      {/* Filters */}
      <AdminFilters search={search} onSearchChange={setSearch} title="Search by name or phone...">
        <Button onClick={applyFilters} variant="outline" size="sm">
          Apply
        </Button>
      </AdminFilters>

      {isFetching && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
          Loading customers...
        </p>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Customers API failed: {error?.message || 'Unable to load customers'}
        </div>
      )}

      {/* Customer Table */}
      <AdminTable
        rows={customers}
        columns={[
          {
            key: 'name',
            label: 'Customer',
            render: row => (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-sm font-black text-pink-600">
                  {(row.name || row.phoneNumber || 'G').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{row.name || 'Guest Customer'}</p>
                  <p className="text-xs text-gray-500">{row.phoneNumber}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'email',
            label: 'Email',
            render: row => row.email || <span className="text-gray-400">-</span>,
          },
          { key: 'role', label: 'Role', render: row => getRoleBadge(row.role) },
          {
            key: 'profileCompleted',
            label: 'Profile',
            render: row => (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.profileCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
              >
                {row.profileCompleted ? 'Complete' : 'Pending'}
              </span>
            ),
          },
          {
            key: 'isBlocked',
            label: 'Status',
            render: row => (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
              >
                {row.isBlocked ? 'Blocked' : 'Active'}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: row => (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(row)}>
                  <Eye size={14} />
                </Button>
                {!isAdminRole(row.role) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBlockToggle(row.id, row.isBlocked)}
                    className={row.isBlocked ? 'text-green-600' : 'text-red-600'}
                  >
                    {row.isBlocked ? <CheckCircle size={14} /> : <Ban size={14} />}
                  </Button>
                )}
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

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-[1200] flex items-center bg-black/40 p-4"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-2xl font-black text-pink-600">
                  {(selectedCustomer.name || selectedCustomer.phoneNumber || 'G')
                    .slice(0, 1)
                    .toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {selectedCustomer.name || 'Guest Customer'}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedCustomer.phoneNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Status Badges */}
            <div className="mb-6 flex flex-wrap gap-2">
              {getRoleBadge(selectedCustomer.role)}
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${selectedCustomer.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
              >
                {selectedCustomer.isBlocked ? 'Blocked' : 'Active'}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${selectedCustomer.profileCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
              >
                Profile {selectedCustomer.profileCompleted ? 'Complete' : 'Pending'}
              </span>
            </div>

            {/* Customer Info */}
            <div className="mb-6 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-gray-400">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Phone</p>
                    <p className="font-bold text-gray-900">{selectedCustomer.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Email</p>
                    <p className="font-bold text-gray-900">
                      {selectedCustomer.email || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-gray-400">
                  Account Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Role</p>
                    <p className="font-bold text-gray-900 capitalize">
                      {selectedCustomer.role || 'user'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Member Since</p>
                    <p className="font-bold text-gray-900">
                      {selectedCustomer.createdAt
                        ? new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedCustomer.addresses?.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                  <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-gray-400">
                    Saved Addresses
                  </h3>
                  <div className="space-y-2">
                    {selectedCustomer.addresses.map((addr, index) => (
                      <div key={index} className="rounded-lg bg-white p-3">
                        <p className="font-bold text-gray-900">{addr.label || 'Address'}</p>
                        <p className="text-sm text-gray-500">{addr.fullAddress}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {!isAdminRole(selectedCustomer.role) && (
              <div className="border-t border-gray-200 pt-4">
                <Button
                  onClick={() => {
                    handleBlockToggle(selectedCustomer.id, selectedCustomer.isBlocked);
                    setSelectedCustomer(null);
                  }}
                  variant={selectedCustomer.isBlocked ? 'default' : 'destructive'}
                  className={selectedCustomer.isBlocked ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {selectedCustomer.isBlocked ? (
                    <>
                      <CheckCircle size={16} className="mr-2" /> Unblock Customer
                    </>
                  ) : (
                    <>
                      <Ban size={16} className="mr-2" /> Block Customer
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
