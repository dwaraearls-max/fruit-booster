"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Truck,
  Users,
  Menu,
  X,
  Search,
  Bell,
  Store,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
] as const;

type AdminShellProps = {
  userName: string;
  children: React.ReactNode;
};

export function AdminShell({ userName, children }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-slate-800">
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#1B0F2E] text-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/10">
            <Image
              src="/brand/logo.png"
              alt="Fruit Booster"
              fill
              className="object-contain p-0.5"
              sizes="40px"
              priority
            />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">Fruit Booster</p>
            <p className="text-[11px] text-white/45">Manage. Sell. Grow.</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive(href)
                  ? "bg-plum text-gold shadow-lg shadow-plum/30"
                  : "text-white/65 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}

          <p className="px-3 pb-1 pt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
            Sales channels
          </p>
          <Link
            href="/shop"
            target="_blank"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/5 hover:text-white"
          >
            <Store className="h-4 w-4 shrink-0" />
            Online Store
          </Link>
          <Link
            href="/admin/products"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/5 hover:text-white"
          >
            <Settings className="h-4 w-4 shrink-0" />
            Menu settings
          </Link>
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
              <Image
                src="/brand/logo.png"
                alt="Fruit Booster"
                fill
                className="object-contain p-0.5"
                sizes="40px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="text-xs text-white/40">Admin</p>
            </div>
          </div>
          <div className="mt-3">
            <AdminLogoutButton className="text-white/70 hover:text-white" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <button
              type="button"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="relative mx-auto hidden w-full max-w-xl md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search products, orders, customers…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none ring-plum/20 placeholder:text-slate-400 focus:border-plum focus:bg-white focus:ring-2"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="relative rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-white">
                <Image
                  src="/brand/logo.png"
                  alt="Fruit Booster"
                  fill
                  className="object-contain p-0.5"
                  sizes="36px"
                />
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
