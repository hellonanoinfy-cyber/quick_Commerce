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
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from '@/services/admin-service';

const categoryFields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'slug', label: 'Slug', required: true },
  { name: 'description', label: 'Description', wide: true },
  { name: 'displayOrder', label: 'Display Order', type: 'number', required: true },
];

const emptyCategory = {
  name: '',
  slug: '',
  description: '',
  displayOrder: 0,
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyCategory);

  const queryParams = useMemo(
    () => ({ search: appliedSearch, pageNumber: page, pageSize: 20 }),
    [appliedSearch, page]
  );

  const {
    data: categoryPage,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.categories(queryParams),
    queryFn: () => getAdminCategories(queryParams),
    retry: 1,
    staleTime: 30 * 1000,
  });

  const categories = categoryPage?.items || [];
  const meta = categoryPage || { pageNumber: page, totalPages: 1 };

  const applyFilters = () => {
    setPage(1);
    setAppliedSearch(search);
  };

  const handleCreate = () => {
    setFormData(emptyCategory);
    setModalOpen(true);
  };

  const handleEdit = category => {
    setFormData({
      id: category.id,
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== false,
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
      if (formData.id) {
        await updateAdminCategory(formData.id, formData);
      } else {
        await createAdminCategory(formData);
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
          <Plus size={18} /> Add Category
        </Button>
      </div>
      {isFetching && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
          Loading categories...
        </p>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Categories API failed: {error?.message || 'Unable to load categories'}
        </div>
      )}
      <AdminTable
        rows={categories}
        columns={[
          { key: 'name', label: 'Category' },
          { key: 'slug', label: 'Slug' },
          { key: 'displayOrder', label: 'Order' },
          { key: 'isActive', label: 'Status', render: row => (row.isActive ? 'Active' : 'Hidden') },
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
                  onClick={() => deleteAdminCategory(row.id).then(() => refetch())}
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
        title={formData.id ? 'Edit Category' : 'Create Category'}
        onClose={() => setModalOpen(false)}
      >
        <AdminForm
          fields={categoryFields}
          values={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </AdminModal>
    </div>
  );
}
