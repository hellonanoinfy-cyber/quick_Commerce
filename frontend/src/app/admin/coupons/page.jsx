'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import AdminFilters from '@/components/admin/AdminFilters';
import AdminForm from '@/components/admin/AdminForm';
import AdminModal from '@/components/admin/AdminModal';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminTable from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/Button';
import { queryKeys } from '@/hooks/queries/query-keys';
import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCoupons,
  updateAdminCoupon,
} from '@/services/admin-service';

const couponFields = [
  { name: 'code', label: 'Code', required: true },
  { name: 'type', label: 'Type (Percentage/FixedAmount)', required: true },
  { name: 'value', label: 'Value', type: 'number', required: true },
  { name: 'minOrderAmount', label: 'Min Order Amount', type: 'number' },
  { name: 'maxDiscountAmount', label: 'Max Discount Amount', type: 'number' },
  { name: 'usageLimit', label: 'Total Usage Limit', type: 'number' },
  { name: 'maxUsesPerUser', label: 'Max Uses Per User', type: 'number' },
  { name: 'expiresAt', label: 'Expiry Date', type: 'date', required: true },
];

const emptyCoupon = {
  code: '',
  type: 'Percentage',
  value: 0,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  usageLimit: 0,
  maxUsesPerUser: 1,
  expiresAt: '',
  isActive: true,
};

export default function AdminCouponsPage() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyCoupon);

  const queryParams = useMemo(
    () => ({ search: appliedSearch, pageNumber: page, pageSize: 20 }),
    [appliedSearch, page]
  );

  const {
    data: couponPage,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.coupons(queryParams),
    queryFn: () => getAdminCoupons(queryParams),
    retry: 1,
    staleTime: 30 * 1000,
  });

  const coupons = couponPage?.items || [];
  const meta = couponPage || { pageNumber: page, totalPages: 1 };

  const applyFilters = () => {
    setPage(1);
    setAppliedSearch(search);
  };

  const handleCreate = () => {
    setFormData(emptyCoupon);
    setModalOpen(true);
  };

  const handleEdit = coupon => {
    setFormData({
      id: coupon.id,
      code: coupon.code || '',
      type: coupon.type || 'Percentage',
      value: coupon.value || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      usageLimit: coupon.usageLimit || 0,
      maxUsesPerUser: coupon.maxUsesPerUser || 1,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.substring(0, 10) : '',
      isActive: coupon.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.expiresAt) {
        alert('Expiry date is required');
        return;
      }
      payload.expiresAt = new Date(payload.expiresAt).toISOString();

      if (formData.id) {
        await updateAdminCoupon(formData.id, payload);
      } else {
        await createAdminCoupon(payload);
      }
      setModalOpen(false);
      refetch();
    } catch (error) {
      alert('Operation failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminFilters search={search} onSearchChange={setSearch}>
          <Button onClick={applyFilters} variant="outline">
            Apply
          </Button>
        </AdminFilters>
        <Button onClick={handleCreate} className="bg-[#C0185E]">
          <Plus size={18} /> Add Coupon
        </Button>
      </div>
      {isFetching && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
          Loading coupons...
        </p>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Coupons API failed: {error?.message || 'Unable to load coupons'}
        </div>
      )}
      <AdminTable
        rows={coupons}
        columns={[
          { key: 'code', label: 'Code' },
          { key: 'type', label: 'Type' },
          {
            key: 'value',
            label: 'Discount',
            render: row => (row.type === 'Percentage' ? `${row.value}%` : `Rs. ${row.value}`),
          },
          {
            key: 'expiresAt',
            label: 'Expiry',
            render: row => new Date(row.expiresAt).toLocaleDateString(),
          },
          { key: 'usedCount', label: 'Used' },
          {
            key: 'isActive',
            label: 'Status',
            render: row => (row.isActive ? 'Active' : 'Disabled'),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: row => (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleEdit(row)}
                  className="text-xs font-black text-pink-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteAdminCoupon(row.id).then(() => refetch())}
                  className="text-xs font-black text-red-600"
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
      <AdminModal
        open={modalOpen}
        title={formData.id ? 'Edit Coupon' : 'Create Coupon'}
        onClose={() => setModalOpen(false)}
      >
        <AdminForm
          fields={couponFields}
          values={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </AdminModal>
    </div>
  );
}
