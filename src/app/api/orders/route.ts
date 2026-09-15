import { z } from "zod";
import { NextResponse } from "next/server";
import { isValidGhPhone } from "@/lib/ghana";
import { nowIso } from "@/lib/ids";
import { initializePayment, getPaymentProvider } from "@/lib/payments";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getCartId } from "@/services/cart";
import { createOrderFromCart } from "@/services/orders";
import { sendOrderEmails } from "@/lib/email";

const schema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(9),
  whatsappNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  deliveryType: z.enum(["DELIVERY", "PICKUP"]),
  area: z.string().optional(),
  deliveryAddress: z.string().optional(),
  landmark: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  pickupLocationId: z.string().optional(),
  deliveryZoneId: z.string().optional(),
  promoCode: z.string().optional(),
  paymentMethod: z.enum(["momo", "card"]),
  momoNetwork: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    if (!isValidGhPhone(body.phone)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid Ghana phone number." },
        { status: 400 },
      );
    }
    if (body.deliveryType === "DELIVERY" && !body.landmark) {
      return NextResponse.json(
        { success: false, message: "Please provide a landmark for delivery." },
        { status: 400 },
      );
    }

    const cartId = await getCartId();
    const order = await createOrderFromCart({
      ...body,
      email: body.email || undefined,
      cartId,
    });

    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const email = body.email || `${body.phone.replace(/\D/g, "")}@fruitfusion.gh`;
    const redirectUrl = `${site}/order/${order.publicToken}`;
    const callbackUrl = `${site}/api/payments/moolre/webhook`;

    const pay = await initializePayment({
      email,
      phone: body.phone,
      amountGhs: order.totalGhs,
      reference: order.publicToken,
      callbackUrl,
      redirectUrl,
      paymentMethod: body.paymentMethod,
      momoNetwork: body.momoNetwork,
    });

    const sb = getSupabaseAdmin();
    await sb
      .from("Order")
      .update({
        paystackRef: pay.reference,
        paymentProvider: pay.provider,
        momoNetwork: body.momoNetwork ?? null,
        updatedAt: nowIso(),
      })
      .eq("id", order.id);

    void sendOrderEmails({
      orderNumber: order.orderNumber,
      publicToken: order.publicToken,
      customerName: order.customerName,
      phone: order.phone,
      email: body.email || null,
      totalGhs: order.totalGhs,
      deliveryType: order.deliveryType,
      area: order.area,
      items: (order.items || []).map((i: {
        productNameSnapshot: string;
        quantity: number;
        subtotalGhs: number;
      }) => ({
        name: i.productNameSnapshot,
        quantity: i.quantity,
        subtotalGhs: i.subtotalGhs,
      })),
    }).catch((err) => console.warn("[email] order notify failed:", err));

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        token: order.publicToken,
        totalGhs: order.totalGhs,
        provider: pay.provider,
        authorizationUrl: "authorizationUrl" in pay ? pay.authorizationUrl : undefined,
        pendingMoMo: "pendingMoMo" in pay ? pay.pendingMoMo : false,
        requiresOtp: "requiresOtp" in pay ? pay.requiresOtp : false,
        sessionId: "sessionId" in pay ? pay.sessionId : undefined,
        demo: pay.demo,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create order.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: { provider: getPaymentProvider() },
  });
}
