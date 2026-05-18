'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import AdminFilters from '@/components/admin/AdminFilters';
import AdminModal from '@/components/admin/AdminModal';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminProductForm from '@/components/admin/AdminProductForm';
import AdminTable from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/Button';
import { queryKeys } from '@/hooks/queries/query-keys';
import {
  deleteAdminProduct,
  getAdminProducts,
  toggleAdminProduct,
  updateAdminStock,
} from '@/services/admin-service';

const productFields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'slug', label: 'Slug', required: true },
  { name: 'sku', label: 'SKU', required: true },
  { name: 'price', label: 'Price', type: 'number', required: true },
  { name: 'stockQuantity', label: 'Stock', type: 'number', required: true },
  { name: 'categoryId', label: 'Category ID', required: true },
  { name: 'brandId', label: 'Brand ID', required: true },
  { name: 'shortDescription', label: 'Short Description', wide: true },
];

const emptyProduct = {
  name: '',
  slug: '',
  sku: '',
  price: '',
  stockQuantity: '',
  categoryId: '',
  brandId: '',
  shortDescription: '',
};

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const queryParams = useMemo(
    () => ({ search: appliedSearch, pageNumber: page, pageSize: 20 }),
    [appliedSearch, page]
  );

  const {
    data: productPage,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.products(queryParams),
    queryFn: () => getAdminProducts(queryParams),
    retry: 1,
    staleTime: 30 * 1000,
  });

  const products = productPage?.items || [];
  const meta = productPage || { pageNumber: page, totalPages: 1 };

  const applyFilters = () => {
    setPage(1);
    setAppliedSearch(search);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEdit = product => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    refetch();
  };

  const handleCancel = () => {
    setModalOpen(false);
    setSelectedProduct(null);
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
          <Plus size={18} /> Add Product
        </Button>
      </div>
      {isFetching && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
          Loading products...
        </p>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Products API failed: {error?.message || 'Unable to load products'}
        </div>
      )}
      <AdminTable
        rows={products}
        columns={[
          { key: 'name', label: 'Product' },
          { key: 'sku', label: 'SKU' },
          { key: 'categoryName', label: 'Category' },
          { key: 'price', label: 'Price', render: row => `Rs. ${row.price}` },
          {
            key: 'stockQuantity',
            label: 'Stock',
            render: row => (
              <input
                defaultValue={row.stockQuantity}
                onBlur={event =>
                  updateAdminStock(row.id, Number(event.target.value)).then(() => refetch())
                }
                className="h-9 w-20 rounded-full border border-gray-200 px-3 text-sm font-black"
              />
            ),
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
                  onClick={() => toggleAdminProduct(row.id).then(() => refetch())}
                  className="text-xs font-black text-pink-600"
                >
                  {row.isActive ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => deleteAdminProduct(row.id).then(() => refetch())}
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
        title={selectedProduct ? 'Edit Product' : 'Create Product'}
        onClose={handleCancel}
      >
        <AdminProductForm
          product={selectedProduct}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </AdminModal>
    </div>
  );
}
