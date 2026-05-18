import EmptyState from '@/components/common/EmptyState';
import StorePageShell from '@/components/common/StorePageShell';

export default function OrdersPage() {
  return (
    <StorePageShell
      eyebrow="Orders"
      title="My Orders"
      description="Track recent purchases, delivery status, returns, and order support."
      breadcrumbs={[{ label: 'Orders' }]}
    >
      <EmptyState
        title="No orders to show"
        description="Your recent MummaXpress orders will appear here after checkout."
        actionLabel="START SHOPPING"
        actionHref="/products"
      />
    </StorePageShell>
  );
}
