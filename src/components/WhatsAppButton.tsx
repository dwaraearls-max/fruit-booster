"use client";

import { usePathname } from "next/navigation";
import { waLink } from "@/lib/ghana";

export function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  async function handleClick() {
    const res = await fetch("/api/whatsapp");
    const json = await res.json();
    const message = json.success ? json.data.message : "Hello FruitFusionX, I'd like to order juice!";
    window.open(waLink(message), "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-leaf px-4 py-3 text-sm font-bold text-white shadow-xl transition hover:scale-105 md:bottom-6"
    >
      <span>💬</span>
      <span className="hidden sm:inline">ORDER ON WHATSAPP</span>
      <span className="sm:hidden">WhatsApp</span>
    </button>
  );
}
