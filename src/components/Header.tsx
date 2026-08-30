"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "./providers/CartProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Our Smoothies" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount, setCartOpen } = useCart();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-gold/25 bg-plum/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 md:px-6 md:py-3">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/brand/logo.png"
            alt="Fruit Booster"
            width={360}
            height={120}
            className="h-16 w-auto object-contain md:h-20 lg:h-24"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium transition hover:text-gold",
                pathname === l.href ? "text-gold" : "text-gold/90",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-bold text-plum transition hover:bg-gold-warm"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-plum-dark text-xs text-gold">
                {itemCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-gold md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-gold/25 px-4 py-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-lg font-medium text-gold hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
