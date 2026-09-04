"use client";

import Link from "next/link";
import Image from "next/image";
import { formatGhs } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";

export default function CartPage() {
  const { lines, subtotalGhs, loading, updateQuantity, removeItem } = useCart();

  if (loading) {
    return <div className="py-20 text-center">Loading cart...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="text-3xl font-black text-plum">Your Cart</h1>
      {lines.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-plum/70">No juices yet. Let&apos;s fix that!</p>
          <Link href="/shop" className="mt-6 inline-block rounded-full bg-gold px-8 py-3 font-bold text-plum">
            ORDER YOUR SMOOTHIE
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-4">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-4 rounded-2xl border border-plum/15 bg-white p-4 shadow-sm">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gold-pale">
                  <Image src={line.imageUrl} alt={line.name} fill className="object-contain" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-plum">{line.name}</p>
                  <p className="font-semibold text-plum">{formatGhs(line.subtotalGhs)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.id, line.quantity - 1)}
                      className="rounded-full border border-plum/30 bg-white px-3 py-1 text-sm font-bold text-plum hover:bg-plum/5"
                    >
                      −
                    </button>
                    <span className="px-2 font-bold text-plum">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.id, line.quantity + 1)}
                      className="rounded-full border border-plum/30 bg-white px-3 py-1 text-sm font-bold text-plum hover:bg-plum/5"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(line.id)}
                      className="ml-auto text-sm font-semibold text-plum underline-offset-2 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center justify-between text-xl font-bold text-plum">
            <span>Total</span>
            <span>{formatGhs(subtotalGhs)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-plum py-4 text-center font-bold text-gold hover:bg-plum-light"
          >
            CHECKOUT
          </Link>
        </>
      )}
    </div>
  );
}
