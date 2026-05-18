'use client';

import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Home } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function OrderSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  useEffect(() => {
    // Trigger confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white px-4 py-20">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-500 mb-8"
      >
        <CheckCircle2 size={48} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center max-w-lg"
      >
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Yay! Order Placed</h1>
        <p className="text-gray-500 text-lg mb-10">
          Thank you for shopping with us! Your order is being processed and will be with you soon.
        </p>

        <Card className="p-8 border-none bg-gray-50 rounded-[2.5rem] mb-12 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Order Tracking ID
            </p>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              {orderId.toString().slice(0, 12).toUpperCase()}...
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                Processing
              </span>
            </div>
          </div>
          <Package className="absolute -right-8 -bottom-8 w-40 h-40 text-gray-100 rotate-12" />
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => router.push(`/account/orders/${orderId}`)}
            className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold flex items-center gap-3 shadow-xl shadow-gray-200"
          >
            Track Order <ArrowRight size={18} />
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="w-full sm:w-auto h-14 px-10 rounded-2xl text-gray-400 font-bold hover:text-[var(--brand-primary)] transition-colors flex items-center gap-3"
          >
            <Home size={18} /> Back to Home
          </Button>
        </div>
      </motion.div>

      {/* Suggested Items CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-20 pt-10 border-t border-gray-100 w-full max-w-2xl text-center"
      >
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
          Want to add more?
        </p>
        <div className="flex justify-center gap-8 text-gray-300">
          <ShoppingBag size={24} />
          <ShoppingBag size={24} />
          <ShoppingBag size={24} />
        </div>
      </motion.div>
    </div>
  );
}
