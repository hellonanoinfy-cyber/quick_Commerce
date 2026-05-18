'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import AdminForm from '@/components/admin/AdminForm';
import AdminTable from '@/components/admin/AdminTable';
import { queryKeys } from '@/hooks/queries/query-keys';
import {
  createAdminBanner,
  deleteAdminBanner,
  getAdminBanners,
  updateAdminBanner,
} from '@/services/admin-service';

const fields = [
  { name: 'title', label: 'Banner Title', required: true },
  { name: 'subtitle', label: 'Subtitle', required: false },
  { name: 'imageUrl', label: 'Image URL', required: true, wide: true },
  { name: 'targetUrl', label: 'Target URL', required: true, wide: true },
  { name: 'targetType', label: 'Target Type (e.g., category, product)' },
  { name: 'displayOrder', label: 'Display Order', type: 'number', required: true },
];

const emptyBanner = {
  title: '',
  subtitle: '',
  imageUrl: '',
  targetUrl: '',
  targetType: '',
  displayOrder: 0,
  isActive: true,
};

export default function AdminBannersPage() {
  const [formData, setFormData] = useState(emptyBanner);

  const queryParams = useMemo(() => ({ pageNumber: 1, pageSize: 50 }), []);

  const {
    data: bannerPage,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.banners(queryParams),
    queryFn: () => getAdminBanners(queryParams),
    retry: 1,
    staleTime: 30 * 1000,
  });

  const banners = bannerPage?.items || [];

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
      if (formData.id) {
        await updateAdminBanner(formData.id, formData);
      } else {
        await createAdminBanner(formData);
      }
      setFormData(emptyBanner);
      refetch();
    } catch (error) {
      alert('Operation failed');
    }
  };

  const handleEdit = banner => {
    setFormData({
      id: banner.id,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl || '',
      targetUrl: banner.targetUrl || '',
      targetType: banner.targetType || '',
      displayOrder: banner.displayOrder || 0,
      isActive: banner.isActive !== false,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm self-start">
        <h2 className="mb-4 text-xl font-black text-gray-900">
          {formData.id ? 'Edit Banner' : 'Add Banner'}
        </h2>
        <AdminForm
          fields={fields}
          values={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={formData.id ? 'Update Banner' : 'Save Banner'}
        />
        {formData.id && (
          <button
            type="button"
            className="mt-4 w-full text-sm font-bold text-gray-500 hover:text-gray-900"
            onClick={() => setFormData(emptyBanner)}
          >
            Cancel Edit
          </button>
        )}
      </section>
      <section className="space-y-3">
        {isFetching && (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
            Loading banners...
          </p>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            Banners API failed: {error?.message || 'Unable to load banners'}
          </div>
        )}
        <AdminTable
          rows={banners}
          columns={[
            { key: 'title', label: 'Banner' },
            { key: 'targetUrl', label: 'Target' },
            { key: 'displayOrder', label: 'Order' },
            {
              key: 'isActive',
              label: 'Status',
              render: row => (row.isActive ? 'Active' : 'Paused'),
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
                    onClick={() => deleteAdminBanner(row.id).then(() => refetch())}
                    className="text-xs font-black text-red-600"
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
