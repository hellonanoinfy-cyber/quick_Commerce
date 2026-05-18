'use client';

import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';
import { Search, X, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { ProductImage } from '@/components/ui/ProductImage';
import axios from '@/lib/api/client';

const RECENT_SEARCHES_KEY = 'fc_recent_searches';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Click Outside logic implementation (replacing react-use useClickAway)
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }

    if (isFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFocused]);

  const saveSearch = q => {
    if (!q.trim()) return;
    const filtered = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(filtered);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  };

  const fetchResults = useMemo(
    () =>
      debounce(async q => {
        if (!q) return;
        setLoading(true);
        try {
          const { data } = await axios.get('/api/v1/search', {
            params: { q, limit: 8 },
          });
          setResults(data?.data || { products: [], categories: [], brands: [] });
          setSelectedIndex(-1);
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    if (query) fetchResults(query);

    return () => {
      fetchResults.cancel();
    };
  }, [query, fetchResults]);

  // Keyboard Navigation Logic
  const allResultItems = useMemo(
    () => [
      ...(results?.categories?.slice(0, 3).map(c => ({ type: 'category', ...c })) || []),
      ...(results?.brands?.slice(0, 2).map(b => ({ type: 'brand', ...b })) || []),
      ...(results?.products?.slice(0, 8).map(p => ({ type: 'product', ...p })) || []),
    ],
    [results]
  );

  const handleKeyDown = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allResultItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        const item = allResultItems[selectedIndex];
        navigateToItem(item);
      } else {
        handleSearch(query);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const navigateToItem = item => {
    saveSearch(query || item.name);
    setIsFocused(false);
    if (item.type === 'category') router.push(`/products?category=${item.slug}`);
    else if (item.type === 'brand') router.push(`/products?brand=${item.slug}`);
    else if (item.type === 'product') router.push(`/products/${item.slug}`);
  };

  const handleSearch = q => {
    if (!q.trim()) return;
    saveSearch(q);
    setIsFocused(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  return (
    <div ref={containerRef} className="group relative mx-auto w-full max-w-xl">
      {/* Search Input Area */}
      <div
        className={`relative flex items-center transition-all duration-500 ease-out z-[60] ${isFocused ? 'scale-[1.02]' : ''}`}
      >
        <input
          type="text"
          value={query}
          onChange={e => {
            const value = e.target.value;
            setQuery(value);
            if (!value) {
              setResults(null);
              setSelectedIndex(-1);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for diapers, milk, wipes..."
          className={`w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-11 text-sm font-medium outline-none transition-all duration-300 sm:py-3 sm:pl-5 sm:pr-12
            ${isFocused ? 'border-[var(--brand-primary)]/30 bg-white shadow-md ring-2 ring-[var(--brand-primary)]/10' : 'hover:border-gray-300'}`}
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-4 p-1 text-gray-400 transition-all hover:rounded-full hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <div
            className={`pointer-events-none absolute right-4 transition-colors duration-300 ${isFocused ? 'text-[var(--brand-primary)]' : 'text-gray-400'}`}
          >
            <Search className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Dropdown Overlay */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute left-0 right-0 top-full z-50 mt-3 max-h-[75vh] overflow-hidden overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] no-scrollbar sm:rounded-[2rem]"
          >
            {/* Empty Input - Show Recent & Trending */}
            {!query && (
              <div className="p-4 sm:p-8">
                {recentSearches.length > 0 && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Recent Searches
                      </h3>
                      <button
                        onClick={clearRecent}
                        className="text-[10px] font-bold text-[var(--brand-primary)] hover:text-[var(--brand-hover)] transition-colors"
                      >
                        CLEAR ALL
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map(s => (
                        <button
                          key={s}
                          onClick={() => handleSearch(s)}
                          className="px-4 py-2 bg-gray-50 hover:bg-[var(--brand-light)] hover:text-[var(--brand-hover)] rounded-full text-xs font-bold text-gray-600 transition-all border border-transparent hover:border-[violet-100]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Popular Now
                  </h3>
                  <div className="space-y-1">
                    {['Baby Shampoo', 'Diaper Pants', 'Wooden Toys', 'Maternity Gowns'].map(t => (
                      <button
                        key={t}
                        onClick={() => handleSearch(t)}
                        className="flex items-center w-full p-3 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 group transition-all"
                      >
                        <span className="w-8 text-gray-300 group-hover:text-[violet-400] transition-colors">
                          #
                        </span>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Searching State */}
            {loading && (
              <div className="p-8 space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl" />
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {query && !loading && results && (
              <div className="divide-y divide-gray-50">
                {/* Categories & Brands Row */}
                {(results.categories?.length > 0 || results.brands?.length > 0) && (
                  <div className="grid grid-cols-1 gap-4 bg-gray-50/50 p-4 sm:p-6 md:grid-cols-2 md:gap-6">
                    {results.categories?.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-2">
                          Categories
                        </h3>
                        {results.categories.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => navigateToItem({ type: 'category', ...cat })}
                            className="flex items-center justify-between w-full p-2.5 hover:bg-white rounded-xl text-sm font-bold text-gray-800 shadow-sm shadow-transparent hover:shadow-[violet-100]/50 transition-all"
                          >
                            {cat.name}{' '}
                            <ArrowRight className="w-4 h-4 text-[var(--brand-primary)]" />
                          </button>
                        ))}
                      </div>
                    )}
                    {results.brands?.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-2">
                          Brands
                        </h3>
                        <div className="flex flex-wrap gap-2 px-2">
                          {results.brands.map(brand => (
                            <button
                              key={brand.id}
                              onClick={() => navigateToItem({ type: 'brand', ...brand })}
                              className="px-3 py-1.5 bg-white border border-gray-100 hover:border-[var(--brand-primary)] hover:text-[var(--brand-hover)] rounded-full text-xs font-bold text-gray-600 transition-all shadow-sm"
                            >
                              {brand.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Products Section */}
                {results.products?.length > 0 && (
                  <div className="p-6">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">
                      Top Results
                    </h3>
                    <div className="space-y-2">
                      {results.products.slice(0, 8).map((product, idx) => {
                        const globalIdx =
                          (results.categories?.length || 0) + (results.brands?.length || 0) + idx;
                        return (
                          <button
                            key={product.id}
                            onClick={() => navigateToItem({ type: 'product', ...product })}
                            className={`group flex w-full min-w-0 items-center gap-3 rounded-2xl p-3 transition-all sm:gap-4 sm:rounded-[1.5rem]
                              ${selectedIndex === globalIdx ? 'bg-[var(--brand-light)] ring-2 ring-[var(--brand-primary)]/20' : 'hover:bg-gray-50'}`}
                          >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-2 sm:h-16 sm:w-16">
                              <ProductImage
                                src={product.primaryImageUrl}
                                categorySlug={product.categorySlug}
                                alt={product.name}
                                className="object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <p className="text-[9px] font-black text-[var(--brand-primary)] uppercase tracking-widest">
                                {product.brandName}
                              </p>
                              <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[var(--brand-hover)] transition-colors">
                                {product.name}
                              </h4>
                              <p className="mt-0.5 text-base font-black text-gray-900 sm:text-lg">
                                ₹{product.price}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {allResultItems.length === 0 && (
                  <div className="p-8 text-center sm:p-20">
                    <div className="w-24 h-24 bg-[var(--brand-light)] rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-[violet-200]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No results found</h3>
                    <p className="mt-2 px-0 text-sm text-gray-500 sm:px-12">
                      We couldn&apos;t find anything for &quot;{query}&quot;. Try checking your
                      spelling or use more general terms.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
