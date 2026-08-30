"use client";

import { useEffect, useState } from "react";
import { formatGhs } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  totalGhs: number;
  orderStatus: string;
  paymentStatus: string;
  items: Array<{ productNameSnapshot: string; quantity: number }>;
};

export default function AdminOrdersPage() {
  const [board, setBoard] = useState<Record<string, Order[]>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/orders");
    const json = await res.json();
    if (json.success) setBoard(json.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  async function updateStatus(orderId: string, status: string) {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    load();
  }

  async function confirmPayment(orderId: string) {
    await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    load();
  }

  const columns = [
    ["NEW", "NEW", "PAYMENT_CONFIRMED"],
    ["PREPARING", "PREPARING"],
    ["READY", "READY"],
    ["OUT_FOR_DELIVERY", "OUT FOR DELIVERY"],
    ["COMPLETED", "COMPLETED"],
  ] as const;

  if (loading) return <p>Loading orders...</p>;

  return (
    <div>
      <h1 className="text-3xl font-black text-plum">Live Order Board</h1>
      <div className="mt-8 grid gap-4 overflow-x-auto lg:grid-cols-5">
        {columns.map(([key, label, nextStatus]) => (
          <div key={key} className="min-w-[220px] rounded-2xl bg-gold/10 p-4 shadow">
            <h2 className="mb-4 font-bold text-plum">{label}</h2>
            <div className="space-y-3">
              {(board[key] || []).map((order) => (
                <div key={order.id} className="rounded-xl border border-plum/10 p-3 text-sm">
                  <p className="font-bold">{order.orderNumber}</p>
                  <p>{order.customerName}</p>
                  <p className="text-plum/60">{formatGhs(order.totalGhs)}</p>
                  <p className="text-xs">{order.paymentStatus}</p>
                  {order.paymentStatus !== "SUCCESS" && (
                    <button
                      type="button"
                      onClick={() => confirmPayment(order.id)}
                      className="mt-2 w-full rounded bg-gold py-1 text-xs font-bold"
                    >
                      Confirm Payment
                    </button>
                  )}
                  {nextStatus && (
                    <button
                      type="button"
                      onClick={() => updateStatus(order.id, nextStatus)}
                      className="mt-2 w-full rounded bg-plum py-1 text-xs font-bold text-gold"
                    >
                      → {nextStatus.replace(/_/g, " ")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
