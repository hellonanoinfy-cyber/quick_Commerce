'use client';

import { motion } from 'framer-motion';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import Image from 'next/image';

import PremiumCard from '@/components/store/PremiumCard';
import { fadeUp, staggerContainer } from '@/lib/design/motion';

const CHANNELS = [
  {
    icon: Phone,
    title: 'Call Us',
    value: '+91 80 1234 5678',
    hint: '10 AM - 10 PM',
    iconBg: 'bg-[var(--brand-light)]',
    iconColor: 'text-[var(--brand-primary)]',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: '+91 80 1234 5678',
    hint: '10 AM - 10 PM',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: Mail,
    title: 'Email Us',
    value: 'support@mummaxpress.in',
    hint: 'We reply in 24 hrs',
    iconBg: 'bg-[var(--brand-light)]',
    iconColor: 'text-[var(--brand-primary)]',
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-page)] pb-12">
      <motion.div
        className="store-container py-6 sm:py-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <PremiumCard hover={false} className="relative overflow-hidden p-0">
          <div className="p-5 sm:p-8">
            <motion.h1 variants={fadeUp} className="text-xl font-black text-gray-900 sm:text-2xl">
              We&apos;re here to help!
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-1 text-sm font-medium text-gray-500">
              Get in touch with our support team.
            </motion.p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {CHANNELS.map((ch, i) => {
                const Icon = ch.icon;
                return (
                  <motion.div
                    key={ch.title}
                    variants={fadeUp}
                    custom={i}
                    className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4"
                  >
                    <span
                      className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${ch.iconBg} ${ch.iconColor}`}
                    >
                      <Icon size={20} />
                    </span>
                    <p className="text-sm font-black text-gray-900">{ch.title}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-700">{ch.value}</p>
                    <p className="mt-1 text-xs font-medium text-gray-500">{ch.hint}</p>
                  </motion.div>
                );
              })}
            </div>

            <motion.p variants={fadeUp} className="mt-6 text-sm font-medium text-gray-500">
              We&apos;ll get back to you as soon as possible.
            </motion.p>
          </div>

          <div className="pointer-events-none absolute bottom-0 right-0 hidden h-40 w-40 sm:block md:h-48 md:w-48">
            <Image
              src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e6?w=300&q=80&auto=format"
              alt=""
              fill
              className="object-contain object-bottom"
              sizes="200px"
            />
          </div>
        </PremiumCard>
      </motion.div>
    </main>
  );
}
