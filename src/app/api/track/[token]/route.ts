import { NextResponse } from "next/server";
import { getOrderByToken, markOrderPaid } from "@/services/orders";
import { verifyPayment } from "@/lib/payments";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const order = await getOrderByToken(token);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ success: false, message: "Could not load order." }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { reference } = (await req.json()) as { reference?: string };
    const ref = reference || token;

    const order = await getOrderByToken(token);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    const provider = (order.paymentProvider as "moolre" | "paystack" | "demo" | null) || undefined;
    const result = await verifyPayment(ref, provider);

    if (result.status !== "success" && !result.demo) {
      return NextResponse.json({ success: false, message: "Payment not complete." }, { status: 400 });
    }

    const updated = await markOrderPaid(ref);
    if (!updated) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, message: "Payment verification failed." }, { status: 500 });
  }
}
