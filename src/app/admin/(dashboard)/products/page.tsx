"use client";

import { useEffect, useState } from "react";
import { formatGhs } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  available: boolean;
  bestSeller: boolean;
  featured: boolean;
  sizes: Array<{ id: string; label: string; priceGhs: number }>;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  async function load() {
    const res = await fetch("/api/admin/products");
    const json = await res.json();
    if (json.success) setProducts(json.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(id: string, field: string, value: boolean) {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-plum">Products</h1>
      <div className="mt-8 space-y-4">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl bg-gold/10 p-6 shadow">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{p.name}</h2>
                <p className="text-sm text-plum/60">
                  {p.sizes.map((s) => `${s.label}: ${formatGhs(s.priceGhs)}`).join(" · ")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggle(p.id, "available", !p.available)}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${p.available ? "bg-gold text-plum" : "bg-plum-dark text-gold"}`}
                >
                  {p.available ? "Available" : "Sold Out"}
                </button>
                <button
                  type="button"
                  onClick={() => toggle(p.id, "bestSeller", !p.bestSeller)}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${p.bestSeller ? "bg-gold text-plum" : "bg-plum/10"}`}
                >
                  Best Seller
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
