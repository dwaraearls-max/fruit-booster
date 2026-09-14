"use client";

import { useEffect, useState } from "react";
import { formatGhs } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  totalGhs: number;
  orderStatus: string;
  paymentStatus: string;
  deliveryType: string;
  items: Array<{ productNameSnapshot: string; quantity: number }>;
};

const COLUMNS = [
  { key: "NEW", label: "New / Paid" },
  { key: "PREPARING", label: "Preparing" },
  { key: "READY", label: "Ready" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "COMPLETED", label: "Completed" },
] as const;

const NEXT: Record<string, { status: string; label: string }> = {
  NEW: { status: "PAYMENT_CONFIRMED", label: "Confirm & Queue" },
  PAYMENT_CONFIRMED: { status: "PREPARING", label: "Start Preparing" },
  PREPARING: { status: "READY", label: "Mark Ready" },
  READY: { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  OUT_FOR_DELIVERY: { status: "COMPLETED", label: "Complete" },
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
    const interval = setInterval(load, 12000);
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

  async function advance(order: Order) {
    if (order.paymentStatus !== "SUCCESS") {
      await confirmPayment(order.id);
      return;
    }
    if (order.orderStatus === "NEW") {
      await updateStatus(order.id, "PAYMENT_CONFIRMED");
      await updateStatus(order.id, "PREPARING");
      return;
    }
    const step = NEXT[order.orderStatus];
    if (step) await updateStatus(order.id, step.status);
  }

  function actionLabel(order: Order) {
    if (order.paymentStatus !== "SUCCESS") return "Confirm Payment";
    if (order.orderStatus === "NEW") return "Start Preparing";
    return NEXT[order.orderStatus]?.label;
  }

  if (loading) {
    return <p className="text-plum/60">Loading live order board…</p>;
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-black text-plum">Live Order Board</h1>
        <p className="mt-1 text-sm text-plum/55">Auto-refreshes every 12 seconds</p>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="min-w-[240px] flex-1 rounded-2xl border border-plum/10 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-plum">{col.label}</h2>
              <span className="rounded-full bg-plum/10 px-2 py-0.5 text-xs font-bold text-plum">
                {(board[col.key] || []).length}
              </span>
            </div>
            <div className="space-y-3">
              {(board[col.key] || []).map((order) => {
                const label = actionLabel(order);
                return (
                  <div
                    key={order.id}
                    className="rounded-xl border border-plum/10 bg-[#F7F4FB] p-3 text-sm"
                  >
                    <p className="font-bold text-plum">{order.orderNumber}</p>
                    <p className="text-plum/80">{order.customerName}</p>
                    <p className="text-xs text-plum/50">
                      {order.deliveryType} · {order.phone}
                    </p>
                    <p className="mt-1 text-xs text-plum/60">
                      {order.items.map((i) => `${i.productNameSnapshot}×${i.quantity}`).join(", ")}
                    </p>
                    <p className="mt-1 font-semibold text-plum">{formatGhs(order.totalGhs)}</p>
                    <p className="text-[10px] uppercase text-plum/45">{order.paymentStatus}</p>

                    {label && col.key !== "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => advance(order)}
                        className="mt-2 w-full rounded-lg bg-plum py-1.5 text-xs font-bold text-gold"
                      >
                        {label}
                      </button>
                    )}

                    {col.key !== "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(order.id, "CANCELLED")}
                        className="mt-2 w-full rounded-lg border border-rose-200 py-1.5 text-xs font-semibold text-rose-600"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
