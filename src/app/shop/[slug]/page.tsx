import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { getProductBySlug, serializeProduct } from "@/services/products";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product || !("active" in product ? product.active : true)) {
      return { title: "Smoothie not found" };
    }
    return {
      title: product.name,
      description: product.description,
    };
  } catch {
    return { title: "Smoothie" };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const raw = await getProductBySlug(slug);
  const active = raw && ("active" in raw ? raw.active : true);
  if (!raw || !active) notFound();

  return <ProductDetailClient {...serializeProduct(raw)} />;
}
