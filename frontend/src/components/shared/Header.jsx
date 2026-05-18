'use client';

import { useState, useEffect } from 'react';

import HeaderActions from '@/components/layout/header/HeaderActions';
import LocationBar from '@/components/location/LocationBar';
import SearchBar from '@/components/search/SearchBar';
import BrandLogo from '@/components/shared/BrandLogo';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[1000] w-full border-b border-[var(--border-default)] bg-white transition-shadow duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="container mx-auto px-4 py-2.5 sm:py-3">
        <div className="hidden items-center gap-4 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <BrandLogo size="md" />
            <div className="hidden min-w-[150px] max-w-[200px] border-l border-[var(--border-default)] pl-4 xl:block">
              <LocationBar />
            </div>
          </div>
          <SearchBar />
          <HeaderActions />
        </div>

        <div className="flex flex-col gap-2.5 lg:hidden">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" className="min-w-0" />
            <div className="min-w-0 flex-1">
              <SearchBar />
            </div>
            <HeaderActions />
          </div>
          <LocationBar />
        </div>
      </div>
    </header>
  );
};

export default Header;
