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
  if (key === "calories") return String(value);
  return String(value);
}

export function ProductDetailClient({
  id,
  slug,
  name,
  description,
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
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <Link
          href="/shop"
          className="text-sm text-plum/55 hover:text-plum hover:underline"
        >
          ← Back to smoothies
        </Link>

        <div className="mt-6 grid items-start gap-8 md:grid-cols-[minmax(0,42%)_minmax(0,58%)] md:gap-10 lg:gap-14">
          <div className="flex justify-center md:justify-center">
            <div className="relative aspect-[3/4] w-full max-w-[260px] sm:max-w-[300px] md:max-w-[320px]">
              <SmoothieCupImage src={imageUrl} alt={name} variant="detail" priority />
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="font-serif text-3xl font-bold leading-tight text-plum md:text-4xl">
              {name}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-plum/75">
              {detail.ingredients || description}
            </p>

            <div className="mt-5">
              <label htmlFor="size-select" className="sr-only">
                Size
              </label>
              <select
                id="size-select"
                value={sizeId}
                onChange={(e) => setSizeId(e.target.value)}
                className="border border-plum/30 bg-white px-3 py-2 text-sm text-plum focus:border-plum focus:outline-none"
              >
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-plum md:text-xl">Nutritional Information</h2>
              <div className="mt-3 overflow-hidden border border-plum/20">
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
                              ? "bg-plum text-white"
                              : i % 2 === 0
                                ? "bg-white text-plum"
                                : "bg-plum/[0.04] text-plum"
                          }
                        >
                          <td className="px-4 py-2.5 font-medium">{label}</td>
                          <td className="px-4 py-2.5 text-right font-semibold">
                            {formatNutrientValue(key, value)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <p className="text-xl font-bold text-plum">{formatGhs(priceGhs)}</p>
              <button
                type="button"
                disabled={!available || adding || !selected}
                onClick={handleAdd}
                className="rounded bg-plum px-6 py-3 text-sm font-bold uppercase tracking-wide text-gold transition hover:bg-plum-light disabled:opacity-50"
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
