'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Payment is now step 2 of /checkout — redirect legacy URLs */
export default function PaymentPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/checkout?step=1');
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm font-bold text-gray-500">Redirecting to checkout…</p>
    </div>
  );
}
