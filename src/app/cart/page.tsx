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
            ORDER YOUR JUICE
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-4">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={line.imageUrl} alt={line.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{line.name}</p>
                  <p className="font-semibold">{formatGhs(line.subtotalGhs)}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.id, line.quantity - 1)}
                      className="rounded bg-plum/10 px-3 py-1 text-sm"
                    >
                      −
                    </button>
                    <span className="px-2 font-bold">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.id, line.quantity + 1)}
                      className="rounded bg-plum/10 px-3 py-1 text-sm"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(line.id)}
                      className="ml-auto text-sm text-strawberry"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center justify-between text-xl font-bold">
            <span>Total</span>
            <span>{formatGhs(subtotalGhs)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-plum py-4 text-center font-bold text-white hover:bg-plum-light"
          >
            CHECKOUT
          </Link>
        </>
      )}
    </div>
  );
}
