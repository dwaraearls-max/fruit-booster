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
        <div className="fixed left-1/2 top-24 z-[70] -translate-x-1/2 rounded-full border border-plum/20 bg-white px-6 py-3 text-sm font-semibold text-plum shadow-xl">
          {toast}
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setCartOpen(false)} />
      )}

      <aside
        className={`fixed right-0 top-0 z-[65] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-plum/15 px-5 py-4">
          <h2 className="text-xl font-bold text-plum">Your Cart</h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="rounded-full p-1 text-plum hover:bg-plum/10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gold-pale px-5 py-4">
          {lines.length === 0 ? (
            <p className="text-center font-medium text-plum">Your cart is empty. Choose a juice!</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-3 rounded-2xl border border-plum/15 bg-white p-3 shadow-sm"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gold-pale">
                    <Image src={line.imageUrl} alt={line.name} fill className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-plum">{line.name}</p>
                    <p className="text-sm font-semibold text-plum">{formatGhs(line.subtotalGhs)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        className="rounded-full border border-plum/30 bg-white p-1.5 text-plum hover:bg-plum/5"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[1.25rem] text-center text-sm font-bold text-plum">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        className="rounded-full border border-plum/30 bg-white p-1.5 text-plum hover:bg-plum/5"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(line.id)}
                        className="ml-auto text-xs font-semibold text-plum underline-offset-2 hover:underline"
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
          <div className="border-t border-plum/15 bg-white px-5 py-4">
            <div className="mb-4 flex justify-between text-lg font-bold text-plum">
              <span>Total</span>
              <span>{formatGhs(subtotalGhs)}</span>
            </div>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full border-2 border-plum bg-white py-3 font-semibold text-plum hover:bg-plum/5"
              >
                Continue shopping
              </button>
              <Link
                href="/checkout"
                onClick={() => setCartOpen(false)}
                className="rounded-full bg-plum py-3 text-center font-bold text-gold hover:bg-plum-light"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
