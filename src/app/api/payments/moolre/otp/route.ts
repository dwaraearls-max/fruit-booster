import { z } from "zod";
import { NextResponse } from "next/server";
import { initiateMoolreMoMo, moolreChannel } from "@/lib/moolre";
import { markOrderPaid } from "@/services/orders";
import { prisma } from "@/lib/db";
import { verifyMoolrePayment } from "@/lib/moolre";

const schema = z.object({
  orderToken: z.string(),
  otpCode: z.string().min(4),
  sessionId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const order = await prisma.order.findUnique({ where: { publicToken: body.orderToken } });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    const result = await initiateMoolreMoMo({
      phone: order.phone,
      amountGhs: order.totalGhs,
      externalref: order.publicToken,
      channel: moolreChannel(order.momoNetwork || undefined),
      otpcode: body.otpCode,
      sessionid: body.sessionId,
    });

    if (result.requiresOtp) {
      return NextResponse.json({
        success: false,
        message: result.message || "OTP verification still required.",
        requiresOtp: true,
      });
    }

    const verified = await verifyMoolrePayment(order.publicToken);
    if (verified.status === "success") {
      await markOrderPaid(order.publicToken);
      return NextResponse.json({ success: true, data: { paid: true } });
    }

    return NextResponse.json({
      success: true,
      data: {
        paid: false,
        pendingMoMo: true,
        message: "Approve the payment prompt on your phone.",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "OTP verification failed.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
