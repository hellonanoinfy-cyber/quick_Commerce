'use client';

import { Mail, Phone, Share2, Globe, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { useCategories } from '@/hooks/useCategories';

const Footer = () => {
  const { categories } = useCategories();

  const footerLinks = [
    {
      title: 'Shop',
      links: categories?.map(cat => ({
        label: cat.name,
        href: `/products?category=${cat.slug}`,
      })) || [
        { label: 'All Products', href: '/products' },
        { label: 'Featured', href: '/products?sort=featured' },
        { label: 'New Arrivals', href: '/products?sort=newest' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'My Account', href: '/account' },
        { label: 'My Orders', href: '/orders' },
        { label: 'My Wishlist', href: '/wishlist' },
        { label: 'Cart', href: '/cart' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help-center' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Shipping Info', href: '/shipping' },
        { label: 'Returns', href: '/returns' },
      ],
    },
  ];

  // FIX BUG-017: Add pink-tinted shadows for Nurture & Dash design system
  return (
    <footer className="mt-12 rounded-t-[2.5rem] bg-gray-900 pb-10 pt-14 text-white shadow-[0_-20px_60px_-15px_rgba(106,13,173,0.15)] sm:mt-16 sm:rounded-t-[3.5rem] sm:pt-20 lg:mt-20 lg:pt-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid grid-cols-2 gap-10 sm:mb-16 sm:gap-12 md:grid-cols-3 lg:mb-24 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <h1 className="mb-8 text-4xl font-black tracking-tighter">
              MummaXpress<span className="text-[var(--brand-primary)]">.</span>
            </h1>
            <p className="mb-8 max-w-sm font-medium leading-relaxed text-gray-400">
              Your partner in parenting. Premium baby care delivered fast — diapers, feeding,
              fashion, and more.
            </p>
            <div className="flex gap-4">
              {[Globe, MessageCircle, Share2, Mail].map((Icon, i) => (
                <button
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 shadow-md transition-all hover:bg-[var(--brand-primary)] hover:text-white hover:shadow-lg hover:shadow-violet-500/20"
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          {footerLinks.map(section => (
            <div key={section.title}>
              <h4 className="mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-primary)]">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.slice(0, 6).map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-12 border-t border-gray-800 text-center">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
            © {new Date().getFullYear()} MummaXpress · Made with care for parents
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
