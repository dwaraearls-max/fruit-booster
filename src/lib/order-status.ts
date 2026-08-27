import { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "NEW",
  "PAYMENT_CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Order Received",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  PREPARING: "Juice Being Prepared",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Delivered",
  CANCELLED: "Cancelled",
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (to === "CANCELLED") return from !== "COMPLETED" && from !== "CANCELLED";
  const fromIdx = ORDER_STATUS_FLOW.indexOf(from);
  const toIdx = ORDER_STATUS_FLOW.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  return toIdx === fromIdx + 1;
}

export function orderNumber() {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 90000) + 10000);
  return `FF-${year}-${seq}`;
}
