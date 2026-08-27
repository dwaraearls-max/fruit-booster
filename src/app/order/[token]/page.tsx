import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByToken } from "@/services/orders";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/order-status";
import { formatGhs } from "@/lib/utils";
import { waLink } from "@/lib/ghana";
import { buildWhatsAppOrderMessage } from "@/services/orders";
import { OrderVerifyClient } from "@/components/OrderVerifyClient";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ reference?: string; demo?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;

  let order: Awaited<ReturnType<typeof getOrderByToken>> = null;
  try {
    order = await getOrderByToken(token);
  } catch (error) {
    console.error("Order page data load failed:", error);
    notFound();
  }

  if (!order) notFound();

  const steps = ORDER_STATUS_FLOW.map((s) => ({
    status: s,
    label: ORDER_STATUS_LABELS[s],
    done:
      ORDER_STATUS_FLOW.indexOf(order!.orderStatus) >= ORDER_STATUS_FLOW.indexOf(s) ||
      (s === "PAYMENT_CONFIRMED" && order!.paymentStatus === "SUCCESS"),
  }));

  const paid = order.paymentStatus === "SUCCESS";
  const waMessage = buildWhatsAppOrderMessage(order);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <Suspense fallback={null}>
        <OrderVerifyClient token={token} reference={sp.reference} demo={sp.demo} />
      </Suspense>

      <div className="text-center">
        {paid ? (
          <>
            <h1 className="text-4xl font-black text-plum">ORDER CONFIRMED! 🎉</h1>
            <p className="mt-2 text-plum/70">Thank you for choosing Fruit Fusion.</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black text-plum">Order Received</h1>
            <p className="mt-2 text-plum/70">Complete payment to confirm your order.</p>
          </>
        )}
      </div>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-lg">
        <p className="text-sm text-plum/60">Order number</p>
        <p className="text-2xl font-black text-plum">{order.orderNumber}</p>
        <p className="mt-4 text-sm">Customer: <strong>{order.customerName}</strong></p>
        <p className="text-sm">Payment: <strong>{order.paymentStatus.replace("_", " ")}</strong></p>
        <p className="text-sm">Delivery: <strong>{order.deliveryType === "DELIVERY" ? order.area : "Pickup"}</strong></p>

        <ul className="mt-6 space-y-2 border-t pt-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.productNameSnapshot} × {item.quantity}
              </span>
              <span>{formatGhs(item.subtotalGhs)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right text-xl font-bold">{formatGhs(order.totalGhs)}</p>
      </div>

      <div className="mt-8 rounded-3xl bg-plum/5 p-6">
        <h2 className="font-bold text-plum">TRACK MY ORDER</h2>
        <ol className="mt-4 space-y-3">
          {steps.map((step) => (
            <li key={step.status} className="flex items-center gap-3">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step.done ? "bg-leaf text-white" : "bg-plum/20 text-plum/50"}`}>
                {step.done ? "✓" : "○"}
              </span>
              <span className={step.done ? "font-semibold text-plum" : "text-plum/50"}>{step.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link href="/shop" className="rounded-full border-2 border-plum py-3 text-center font-bold text-plum">
          ORDER AGAIN
        </Link>
        <a
          href={waLink(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-leaf py-3 text-center font-bold text-white"
        >
          CHAT WITH US ON WHATSAPP
        </a>
      </div>
    </div>
  );
}
