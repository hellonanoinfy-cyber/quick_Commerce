'use client';

import { Button } from '@/components/ui/Button';

export default function AdminPagination({ page = 1, totalPages = 1, onPageChange }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-3 text-sm font-black text-gray-500">
      <Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <span>
        Page {page} of {Math.max(1, totalPages)}
      </span>
      <Button
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
