'use client';

import { usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';

import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminGuard } from '@/middleware/auth-guard';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Compute title from pathname - stable callback
  const titleFromPath = useCallback(path => {
    const segment = path?.split('/')[2] || 'dashboard';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }, []);

  if (pathname === '/admin/login') {
    return children;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 text-gray-900 lg:grid lg:grid-cols-[288px_1fr]">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-w-0">
          <AdminHeader title={titleFromPath(pathname)} onMenu={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
