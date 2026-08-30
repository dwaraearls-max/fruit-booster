import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { getProductBySlug, serializeProduct } from "@/services/products";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) return { title: "Smoothie not found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  let product: ReturnType<typeof serializeProduct> | null = null;

  try {
    const raw = await getProductBySlug(slug);
    if (raw?.active) product = serializeProduct(raw);
  } catch (error) {
    console.error("Product detail load failed:", error);
  }

  if (!product) notFound();

  return <ProductDetailClient {...product} />;
}
