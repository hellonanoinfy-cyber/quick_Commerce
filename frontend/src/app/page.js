'use client';

import HomeHero from '@/components/home/HomeHero';
import HomeMobileCategories from '@/components/home/HomeMobileCategories';
import HomePromoBanners from '@/components/home/HomePromoBanners';
import HomeShopByNeeds from '@/components/home/HomeShopByNeeds';
import HomeSidebar from '@/components/home/HomeSidebar';
import HomeTopPicks from '@/components/home/HomeTopPicks';
import HomeTrustBar from '@/components/home/HomeTrustBar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-6">
      <div className="container mx-auto px-4 py-4 sm:py-5">
        <div className="flex gap-5 lg:gap-6">
          <HomeSidebar />
          <div className="min-w-0 flex-1 space-y-5 rounded-2xl border border-[#E9DFFC] bg-white p-3 shadow-sm sm:space-y-6 sm:p-4 lg:p-5">
            <HomeMobileCategories />
            <HomeHero />
            <HomeTrustBar />
            <HomeShopByNeeds />
            <HomePromoBanners />
            <HomeTopPicks />
          </div>
        </div>
      </div>
    </div>
  );
}
