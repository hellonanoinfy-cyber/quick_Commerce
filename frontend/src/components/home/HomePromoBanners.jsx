'use client';

import Link from 'next/link';

const PROMOS = [
  {
    title: 'Flat 20% OFF',
    subtitle: 'On Diapers · Code DIAPER20',
    href: '/products?category=baby&sub=diapers',
    className: 'from-violet-600 to-purple-800',
  },
  {
    title: 'Up to 30% OFF',
    subtitle: 'On Bath & Skincare',
    href: '/products?category=baby&sub=bath-and-skin',
    className: 'from-rose-400 to-pink-600',
  },
  {
    title: 'Combo Offers',
    subtitle: 'Save More',
    href: '/products?sort=featured',
    className: 'from-amber-400 to-orange-500',
  },
  {
    title: 'Baby Essentials',
    subtitle: 'Starting ₹99',
    href: '/products?sort=featured',
    className: 'from-violet-300 to-indigo-400',
  },
];

export default function HomePromoBanners() {
  return (
    <section>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {PROMOS.map(p => (
          <Link
            key={p.title}
            href={p.href}
            className={`flex min-h-[100px] flex-col justify-between rounded-2xl bg-gradient-to-br ${p.className} p-4 text-white shadow-md transition-transform hover:scale-[1.02] sm:min-h-[110px] sm:p-5`}
          >
            <div>
              <p className="text-sm font-black sm:text-base">{p.title}</p>
              <p className="mt-1 text-[11px] font-medium opacity-90 sm:text-xs">{p.subtitle}</p>
            </div>
            <span className="mt-3 inline-flex h-8 w-fit items-center rounded-lg bg-white/20 px-3 text-[10px] font-black backdrop-blur-sm">
              Shop Now
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
