"use client";

import { usePathname } from "next/navigation";
import { waLink } from "@/lib/ghana";

export function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  async function handleClick() {
    const res = await fetch("/api/whatsapp");
    const json = await res.json();
    const message = json.success ? json.data.message : "Hello Fruit Booster, I'd like to order juice!";
    window.open(waLink(message), "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Order on WhatsApp"
      className="fixed bottom-[5.75rem] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-lg text-plum shadow-xl transition hover:scale-105 md:bottom-6 md:h-auto md:w-auto md:gap-2 md:px-4 md:py-3 md:text-sm md:font-bold"
    >
      <span aria-hidden>💬</span>
      <span className="hidden md:inline">ORDER ON WHATSAPP</span>
    </button>
  );
}
