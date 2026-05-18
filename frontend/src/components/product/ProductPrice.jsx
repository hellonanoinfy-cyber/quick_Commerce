'use client';

export default function ProductPrice({ product }) {
  const discountPercentage =
    product.discountPrice && product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : product.discountPercentage || 0;

  const sellingPrice = product.discountPrice || product.price;

  return (
    <div className="flex flex-wrap items-baseline gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-section)] px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
      <span className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
        ₹{sellingPrice?.toLocaleString('en-IN')}
      </span>
      {product.discountPrice && product.price > product.discountPrice && (
        <>
          <span className="text-lg font-bold text-gray-400 line-through sm:text-xl">
            ₹{product.price?.toLocaleString('en-IN')}
          </span>
          {discountPercentage > 0 && (
            <span className="rounded-lg bg-[var(--brand-primary)] px-2.5 py-1 text-xs font-black text-white">
              {discountPercentage}% OFF
            </span>
          )}
        </>
      )}
      <p className="w-full text-xs font-medium text-gray-500">Inclusive of all taxes</p>
    </div>
  );
}
