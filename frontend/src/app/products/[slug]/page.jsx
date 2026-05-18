import ProductDetailClient from '@/components/product/ProductDetailClient';

async function getProductForMetadata(slug) {
  const baseUrl =
    process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5181';

  try {
    const response = await fetch(`${baseUrl}/api/v1/products/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.data || payload || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductForMetadata(slug);

  if (!product) {
    return {
      title: 'Product | MummaXpress',
    };
  }

  return {
    title: `${product.name} | MummaXpress`,
    description:
      product.shortDescription || product.description || `Shop ${product.name} on MummaXpress.`,
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
