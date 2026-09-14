"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatGhs } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  imageUrl: string;
  available: boolean;
  bestSeller: boolean;
  featured: boolean;
  isNew: boolean;
  active: boolean;
  sizes: Array<{ id: string; label: string; priceGhs: number }>;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");

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

  async function updatePrice(productId: string, sizeId: string, priceGhs: number) {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId, sizeId, priceGhs }),
    });
    load();
  }

  const filtered = products.filter((p) =>
    !query.trim() ? true : p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div>
      <h1 className="text-3xl font-black text-plum">Menu Items</h1>
      <p className="mt-1 text-sm text-plum/55">Availability, featured flags, and size prices</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search menu…"
        className="mt-6 w-full max-w-md rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm focus:border-plum focus:outline-none"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-2xl border border-plum/10 bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="relative h-20 w-16 shrink-0">
                <Image src={p.imageUrl} alt={p.name} fill className="object-contain" sizes="64px" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-plum">{p.name}</h2>
                <div className="mt-2 space-y-1">
                  {p.sizes.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-xs text-plum/70">
                      <span className="w-16 shrink-0">{s.label}</span>
                      <span>GH₵</span>
                      <input
                        type="number"
                        step="1"
                        defaultValue={s.priceGhs}
                        className="w-20 rounded border border-plum/20 px-2 py-1 text-plum"
                        onBlur={(e) => {
                          const next = Number(e.target.value);
                          if (!Number.isNaN(next) && next !== s.priceGhs) {
                            updatePrice(p.id, s.id, next);
                          }
                        }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  ["available", p.available, p.available ? "Available" : "Sold Out"],
                  ["bestSeller", p.bestSeller, "Best Seller"],
                  ["featured", p.featured, "Featured"],
                  ["isNew", p.isNew, "New"],
                ] as const
              ).map(([field, on, label]) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggle(p.id, field, !on)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    on ? "bg-plum text-gold" : "bg-plum/10 text-plum"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-plum/40">
              Default: {formatGhs(p.sizes[0]?.priceGhs ?? 0)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
