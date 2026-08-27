"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  available: boolean;
  bestSeller: boolean;
  isNew: boolean;
  sizes: Array<{ id: string; name: string; label: string; priceGhs: number }>;
};

function ShopContent({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const initial = searchParams.get("filter") || "all";
  const [filter, setFilter] = useState(initial);

  const filtered = useMemo(() => {
    if (filter === "popular") return products.filter((p) => p.bestSeller);
    if (filter === "new") return products.filter((p) => p.isNew);
    return products;
  }, [products, filter]);

  return (
    <>
      <div className="mt-8 flex justify-center gap-3">
        {[
          ["all", "ALL"],
          ["popular", "POPULAR"],
          ["new", "NEW"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-bold transition",
              filter === key ? "bg-plum text-white" : "bg-white text-plum hover:bg-plum/10",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} {...p} bestSeller={p.bestSeller} isNew={p.isNew} />
        ))}
      </div>
    </>
  );
}

export function ShopClient({ products }: { products: Product[] }) {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading juices...</div>}>
      <ShopContent products={products} />
    </Suspense>
  );
}
