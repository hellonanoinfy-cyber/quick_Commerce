import StorePageShell from '@/components/common/StorePageShell';

export default function ShippingPage() {
  return (
    <StorePageShell
      eyebrow="Delivery"
      title="Shipping Information"
      description="Fast delivery windows, packaging standards, and shipping eligibility for quick-commerce orders."
      breadcrumbs={[{ label: 'Shipping' }]}
    >
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium leading-6 text-gray-600">
          Eligible products are prepared for quick dispatch with secure packaging and clear delivery
          estimates during checkout.
        </p>
      </div>
    </StorePageShell>
  );
}
