"use client";

import { ProductCard } from "@/components/ProductCard";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  flavour?: string;
  imageUrl: string;
  available: boolean;
  bestSeller: boolean;
  isNew: boolean;
  sizes: Array<{ id: string; name: string; label: string; priceGhs: number }>;
};

export function ShopClient({ products }: { products: Product[] }) {
  return (
    <div id="smoothie-catalog" className="mx-auto max-w-7xl bg-gold-pale px-4 pb-16 pt-8 md:px-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3 md:gap-x-10 md:gap-y-14 lg:gap-x-12">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} bestSeller={p.bestSeller} isNew={p.isNew} variant="menu" />
        ))}
      </div>
    </div>
  );
}
