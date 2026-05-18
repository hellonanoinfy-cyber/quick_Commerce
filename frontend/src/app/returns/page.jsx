import StorePageShell from '@/components/common/StorePageShell';

export default function ReturnsPage() {
  return (
    <StorePageShell
      eyebrow="Support"
      title="Returns"
      description="Review return eligibility, refund timelines, and support paths for your purchases."
      breadcrumbs={[{ label: 'Returns' }]}
    >
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium leading-6 text-gray-600">
          Return options depend on product category, condition, and delivery date. Order-specific
          return actions appear in your orders page.
        </p>
      </div>
    </StorePageShell>
  );
}
