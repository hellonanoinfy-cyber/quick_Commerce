'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import LocationProvider from '@/components/location/LocationProvider';
import CategoryNav from '@/components/shared/CategoryNav';
import Footer from '@/components/shared/Footer';
import FooterTrustBar from '@/components/shared/FooterTrustBar';
import Header from '@/components/shared/Header';
import NotificationInitializer from '@/components/shared/NotificationInitializer';

// Dynamic import for heavy components - prevents memory bloat during compilation

const DynamicCartDrawer = dynamic(
  () => import('@/components/cart/CartDrawer').then(mod => mod.CartDrawer || mod.default),
  {
    ssr: false,
    loading: () => null,
  }
);

const DynamicCartHydrator = dynamic(() => import('./CartHydrator'), { ssr: false });

export default function AppChrome({ children }) {
  const pathname = usePathname();

  // Stable admin detection - initialized to false to prevent SSR mismatch
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isHome = pathname === '/';

  useEffect(() => {
    setMounted(true);
    setIsAdmin(pathname?.startsWith('/admin'));
  }, [pathname]);

  // During SSR or initial hydration, render nothing extra
  // The admin layout will handle its own chrome
  if (!mounted) {
    return <>{children}</>;
  }

  if (isAdmin) {
    return children;
  }

  return (
    <LocationProvider>
      <Header />
      <div className={isHome ? 'lg:hidden' : undefined}>
        <CategoryNav />
      </div>
      <DynamicCartHydrator />
      <NotificationInitializer />
      <DynamicCartDrawer />
      {children}
      <FooterTrustBar />
      <Footer />
    </LocationProvider>
  );
}
