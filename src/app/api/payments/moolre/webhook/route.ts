import { NextResponse } from "next/server";
import { parseMoolreWebhook, verifyMoolrePayment } from "@/lib/moolre";
import { markOrderPaid } from "@/services/orders";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = parseMoolreWebhook(body);

    if (parsed.success && parsed.externalref) {
      const verified = await verifyMoolrePayment(parsed.externalref);
      if (verified.status === "success") {
        await markOrderPaid(parsed.externalref, body);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
