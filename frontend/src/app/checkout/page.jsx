'use client';

import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import CatalogBreadcrumbs from '@/components/catalog/CatalogBreadcrumbs';
import BillDetailsCard from '@/components/checkout/BillDetailsCard';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import OrderReview from '@/components/checkout/OrderReview';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import RazorpayDemoModal from '@/components/checkout/RazorpayDemoModal';
import ShippingAddressSelector from '@/components/checkout/ShippingAddressSelector';
import { Button } from '@/components/ui/Button';
import useCart from '@/hooks/useCart';
import { usePlaceOrder } from '@/hooks/usePlaceOrder';
import useAccountStore from '@/stores/account-store';
import useCheckoutStore from '@/stores/checkout-store';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, deliveryFee, total, isLoading, updateQuantity, removeItem } = useCart();
  const { addresses } = useAccountStore();
  const { shippingAddress, setShippingAddress, paymentMethod, setPaymentMethod } =
    useCheckoutStore();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const s = Number(searchParams.get('step'));
    if (s >= 0 && s <= 2) setStep(s);
  }, [searchParams]);
  const tax = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const payable = total + tax;
  const selectedAddress = shippingAddress || addresses.find(address => address.isDefault) || null;

  const { placing, demoModal, demoPaying, error, setDemoModal, placeOrder, handleDemoPay } =
    usePlaceOrder();

  if (items.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-gray-200" />
        <h2 className="text-2xl font-black text-gray-900">Your cart is empty</h2>
        <Button
          onClick={() => router.push('/products')}
          className="mt-4 rounded-xl bg-[var(--brand-primary)] px-8"
        >
          Start shopping
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-page)] pb-12">
      <div className="border-b border-[var(--border-default)] bg-white">
        <div className="store-container py-4">
          <div>
            <CatalogBreadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <CheckoutSteps currentStep={step} />

        <RazorpayDemoModal
          open={Boolean(demoModal)}
          amount={demoModal?.amount}
          orderId={demoModal?.orderId}
          razorpayOrderId={demoModal?.razorpayOrderId}
          onPay={handleDemoPay}
          onClose={() => !demoPaying && setDemoModal(null)}
          loading={demoPaying}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {step === 0 && (
              <ShippingAddressSelector
                selectedAddress={selectedAddress}
                onSelect={setShippingAddress}
                onContinue={() => selectedAddress && setStep(1)}
              />
            )}
            {step === 1 && (
              <>
                <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(0)}
                    className="rounded-xl font-bold"
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-xl bg-[var(--brand-primary)] font-black hover:bg-[var(--brand-hover)]"
                  >
                    Review order
                  </Button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <OrderReview
                  items={items}
                  shippingAddress={selectedAddress}
                  onQuantityChange={updateQuantity}
                  onRemove={removeItem}
                  onPlaceOrder={() => placeOrder(payable)}
                  placing={placing}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="rounded-xl font-bold"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to payment
                </Button>
              </>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>
            )}
          </div>

          <BillDetailsCard
            mrpTotal={subtotal + tax}
            productDiscount={0}
            deliveryFee={deliveryFee}
            tax={tax}
            total={payable}
            showDeliveryGuarantee={step === 0}
            className="sticky top-28 hidden lg:block"
            actionLabel={
              step === 2
                ? placing
                  ? 'Placing order…'
                  : `Pay ₹${payable.toLocaleString('en-IN')}`
                : step === 1
                  ? 'Review order'
                  : 'Continue'
            }
            onAction={
              step === 0
                ? () => selectedAddress && setStep(1)
                : step === 1
                  ? () => setStep(2)
                  : () => placeOrder(payable)
            }
            actionDisabled={step === 0 && !selectedAddress}
            actionLoading={placing}
          />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 lg:hidden">
          <Link href="/cart" className="font-bold text-[var(--brand-primary)]">
            Edit cart
          </Link>
        </p>
      </div>
    </main>
  );
}
