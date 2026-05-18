'use client';

export function ProductZoom({ children }) {
  return (
    <div className="group relative h-full w-full overflow-hidden">
      {children}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30" />
      </div>
    </div>
  );
}

export default ProductZoom;
