"use client";

import { usePathname } from "next/navigation";
import { formatGhs } from "@/lib/utils";
import { useCart } from "./providers/CartProvider";

export function FloatingCartBar() {
  const pathname = usePathname();
  const { itemCount, subtotalGhs, setCartOpen } = useCart();

  if (pathname.startsWith("/admin") || itemCount === 0) return null;

  return (
    <button
      type="button"
      onClick={() => setCartOpen(true)}
      className="fixed bottom-[5.75rem] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-plum px-5 py-3 text-sm font-bold text-gold shadow-2xl transition hover:bg-plum-light md:bottom-6"
    >
      <span>🛒</span>
      <span>
        {itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"} — {formatGhs(subtotalGhs)}
      </span>
    </button>
  );
}
