"use client";

import Link from "next/link";
import { useState } from "react";
import { formatGhs } from "@/lib/utils";
import { SmoothieCupImage } from "@/components/SmoothieCupImage";
import {
  getSmoothieDetail,
  NUTRITION_ROWS,
  type SmoothieNutrition,
} from "@/lib/smoothie-nutrition";
import { useCart } from "./providers/CartProvider";

type Size = { id: string; name: string; label: string; priceGhs: number };

type ProductDetailClientProps = {
  id: string;
  slug: string;
  name: string;
  description: string;
  flavour?: string;
  imageUrl: string;
  available: boolean;
  sizes: Size[];
};

function formatNutrientValue(key: keyof SmoothieNutrition, value: number | string) {
  if (key === "calories") return `${value} kcal`;
  return String(value);
}

export function ProductDetailClient({
  id,
  slug,
  name,
  description,
  flavour,
  imageUrl,
  available,
  sizes,
}: ProductDetailClientProps) {
  const { addItem } = useCart();
  const detail = getSmoothieDetail(slug);
  const [sizeId, setSizeId] = useState(sizes[0]?.id ?? "");
  const [adding, setAdding] = useState(false);

  const selected = sizes.find((s) => s.id === sizeId) ?? sizes[0];
  const priceGhs = selected?.priceGhs ?? 100;

  async function handleAdd() {
    if (!selected || !available) return;
    setAdding(true);
    await addItem(id, selected.id, 1);
    setAdding(false);
  }

  return (
    <div className="bg-gold-pale">
      <div className="h-2 bg-plum" />

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <Link
          href="/shop"
          className="text-sm font-semibold uppercase tracking-wide text-plum/60 hover:text-plum"
        >
          ← Back to smoothies
        </Link>

        <div className="mt-8 grid items-start gap-10 md:grid-cols-2 md:gap-10 lg:gap-12">
          <div className="relative aspect-[3/5] min-h-[28rem] w-full max-w-lg overflow-hidden bg-gold-pale md:min-h-[36rem] md:max-w-none">
            <SmoothieCupImage src={imageUrl} alt={name} variant="detail" priority />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-plum md:text-4xl lg:text-[2.5rem]">{name}</h1>
            <p className="mt-5 text-base leading-relaxed text-plum/70 md:text-lg">
              {detail.ingredients || description}
            </p>

            <div className="mt-8">
              <label htmlFor="size-select" className="sr-only">
                Size
              </label>
              <select
                id="size-select"
                value={sizeId}
                onChange={(e) => setSizeId(e.target.value)}
                className="w-full max-w-xs border border-plum/25 bg-gold/10 px-4 py-3 text-plum focus:border-plum focus:outline-none"
              >
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} — {formatGhs(s.priceGhs)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-bold text-plum md:text-2xl">Nutritional Information</h2>
              <div className="mt-4 overflow-hidden border border-plum/15">
                <table className="w-full text-sm">
                  <tbody>
                    {NUTRITION_ROWS.map(({ key, label }, i) => {
                      const value = detail.nutrition[key];
                      const isCalories = key === "calories";
                      return (
                        <tr
                          key={key}
                          className={
                            isCalories
                              ? "bg-plum text-gold"
                              : i % 2 === 0
                                ? "bg-gold/15 text-plum"
                                : "bg-gold/5 text-plum"
                          }
                        >
                          <td className="px-4 py-3 font-medium">{label}</td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatNutrientValue(key, value)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <p className="text-2xl font-bold text-plum">{formatGhs(priceGhs)}</p>
              <button
                type="button"
                disabled={!available || adding || !selected}
                onClick={handleAdd}
                className="rounded-lg bg-plum px-8 py-4 text-sm font-bold uppercase tracking-wide text-gold transition hover:bg-plum-light disabled:opacity-50"
              >
                {available ? (adding ? "Adding…" : "Add to cart") : "Sold out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
