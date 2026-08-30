"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { formatGhs } from "@/lib/utils";
import { useCart } from "./providers/CartProvider";

export function MiniCart() {
  const {
    lines,
    subtotalGhs,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeItem,
    toast,
    clearToast,
  } = useCart();

  useEffect(() => {
    if (toast) {
      const t = setTimeout(clearToast, 3500);
      return () => clearTimeout(t);
    }
  }, [toast, clearToast]);

  return (
    <>
      {toast && (
        <div className="fixed left-1/2 top-24 z-[70] -translate-x-1/2 rounded-full bg-gold/10 px-6 py-3 text-sm font-semibold text-plum shadow-xl">
          {toast}
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setCartOpen(false)} />
      )}

      <aside
        className={`fixed right-0 top-0 z-[65] flex h-full w-full max-w-md flex-col bg-gold/10 shadow-2xl transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-xl font-bold text-plum">Your Order</h2>
          <button type="button" onClick={() => setCartOpen(false)} aria-label="Close cart">
            <X className="h-6 w-6 text-plum" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="text-center text-plum/60">Your cart is empty. Choose a juice!</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-3 rounded-2xl bg-cream/50 p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image src={line.imageUrl} alt={line.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-plum">{line.name}</p>
                    <p className="text-sm font-semibold text-plum">{formatGhs(line.subtotalGhs)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        className="rounded-full bg-gold/10 p-1 shadow"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-bold">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        className="rounded-full bg-gold/10 p-1 shadow"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(line.id)}
                        className="ml-auto text-xs text-plum-dark"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t px-5 py-4">
            <div className="mb-4 flex justify-between text-lg font-bold text-plum">
              <span>Total</span>
              <span>{formatGhs(subtotalGhs)}</span>
            </div>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full border border-plum/20 py-3 font-semibold text-plum"
              >
                CONTINUE SHOPPING
              </button>
              <Link
                href="/checkout"
                onClick={() => setCartOpen(false)}
                className="rounded-full bg-plum py-3 text-center font-bold text-gold hover:bg-plum-light"
              >
                CHECKOUT
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
