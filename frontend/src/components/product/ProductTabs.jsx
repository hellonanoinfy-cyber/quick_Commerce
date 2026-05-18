'use client';

export default function ProductTabs({ product }) {
  return (
    <section className="mt-12 border-t border-[var(--border-default)] pt-10 sm:mt-16">
      <h2 className="mb-6 text-lg font-black text-gray-900">Product details</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {[
          ['Description', product.description || product.shortDescription],
          [
            'Care instructions',
            'Store in a clean, dry place. Follow usage guidance on the product pack.',
          ],
          [
            'Delivery & returns',
            'Fast delivery on eligible pincodes. Easy returns on unused items per policy.',
          ],
        ].map(([title, body]) => (
          <article
            key={title}
            className="rounded-2xl border border-[var(--border-default)] bg-white p-5 sm:p-6"
          >
            <h3 className="mb-2 text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]">
              {title}
            </h3>
            <p className="text-sm font-medium leading-relaxed text-gray-600">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
