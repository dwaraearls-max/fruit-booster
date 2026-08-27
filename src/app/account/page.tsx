"use client";

import { useState } from "react";
import { formatGhs } from "@/lib/utils";
import Link from "next/link";

export default function AccountPage() {
  const [phone, setPhone] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);
    const res = await fetch(`/api/account?phone=${encodeURIComponent(phone)}&orderNumber=${encodeURIComponent(orderNumber)}`);
    const json = await res.json();
    if (json.success) setOrder(json.data);
    else setError(json.message || "Order not found.");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 md:px-6">
      <h1 className="text-3xl font-black text-plum">Track Your Order</h1>
      <p className="mt-2 text-plum/70">No account needed. Enter your phone and order number.</p>
      <form onSubmit={lookup} className="mt-8 space-y-4">
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-plum/20 px-4 py-3"
          required
        />
        <input
          type="text"
          placeholder="Order number e.g. FF-2026-00128"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="w-full rounded-xl border border-plum/20 px-4 py-3"
          required
        />
        <button type="submit" className="w-full rounded-full bg-plum py-3 font-bold text-white">
          TRACK ORDER
        </button>
      </form>
      {error && <p className="mt-4 text-strawberry">{error}</p>}
      {order && (
        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          <p className="font-bold">{String(order.orderNumber)}</p>
          <p className="text-sm text-plum/70">Status: {String(order.orderStatus)}</p>
          <p className="text-sm">Total: {formatGhs(Number(order.totalGhs))}</p>
          <Link href={`/order/${order.publicToken}`} className="mt-4 inline-block text-plum underline">
            View full details →
          </Link>
        </div>
      )}
    </div>
  );
}
