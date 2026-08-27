import { NextResponse } from "next/server";
import { verifyPaystack, verifyPaystackWebhookSignature } from "@/lib/paystack";
import { markOrderPaid } from "@/services/orders";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (process.env.PAYSTACK_WEBHOOK_SECRET && !verifyPaystackWebhookSignature(body, signature)) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body) as {
      event: string;
      data?: { reference?: string; status?: string };
    };

    if (event.event === "charge.success" && event.data?.reference) {
      const verified = await verifyPaystack(event.data.reference);
      if (verified.status === "success") {
        await markOrderPaid(event.data.reference, event as unknown as Record<string, unknown>);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
