"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { cn, formatGhs } from "@/lib/utils";
import { useCart } from "./providers/CartProvider";

type Size = { id: string; name: string; label: string; priceGhs: number };

type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sizes: Size[];
  available: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  compact?: boolean;
};

export function ProductCard({
  id,
  name,
  description,
  imageUrl,
  sizes,
  available,
  bestSeller,
  isNew,
  compact,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const selected = sizes[0];
  const priceGhs = selected?.priceGhs ?? 100;

  async function handleAdd() {
    if (!selected || !available) return;
    setAdding(true);
    await addItem(id, selected.id, qty);
    setAdding(false);
  }

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-plum/10 transition hover:-translate-y-1 hover:shadow-xl",
        !available && "opacity-60",
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {bestSeller && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-gold px-3 py-1 text-xs font-bold text-plum">
            BEST SELLER
          </span>
        )}
        {isNew && !bestSeller && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-strawberry px-3 py-1 text-xs font-bold text-white">
            NEW
          </span>
        )}
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-contain p-2 transition duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 50vw, 25vw"
        />
      </div>
      <div className={cn("flex flex-1 flex-col p-4 md:p-5", compact && "p-3")}>
        <h3 className="text-lg font-bold text-plum md:text-xl">{name}</h3>
        {!compact && <p className="mt-1 line-clamp-2 text-sm text-plum/70">{description}</p>}
        <p className="mt-3 text-2xl font-bold text-plum">{formatGhs(priceGhs)}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center rounded-full border border-plum/20">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="rounded-l-full p-2 hover:bg-plum/5"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2rem] text-center font-bold">{qty}</span>
            <button
              type="button"
              onClick={() => setQty(Math.min(20, qty + 1))}
              className="rounded-r-full p-2 hover:bg-plum/5"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            disabled={!available || adding || !selected}
            onClick={handleAdd}
            className="flex-1 rounded-full bg-gold px-4 py-3 text-sm font-bold text-plum transition hover:bg-gold-warm disabled:opacity-50"
          >
            {available ? (adding ? "Adding..." : "ADD TO CART") : "SOLD OUT"}
          </button>
        </div>
      </div>
    </article>
  );
}
