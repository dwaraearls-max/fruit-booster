import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/services/auth";
import { updateOrderStatus } from "@/services/orders";
import { getOrdersByStatus } from "@/services/admin";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const board = await getOrdersByStatus();
  return NextResponse.json({ success: true, data: board });
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = z
      .object({ orderId: z.string(), status: z.nativeEnum(OrderStatus), note: z.string().optional() })
      .parse(await req.json());
    const order = await updateOrderStatus(body.orderId, body.status, session.id, body.note);
    return NextResponse.json({ success: true, data: order });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update order.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { orderId } = z.object({ orderId: z.string() }).parse(await req.json());
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "SUCCESS",
        orderStatus: order.orderStatus === "NEW" ? "PAYMENT_CONFIRMED" : order.orderStatus,
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, message: "Could not confirm payment." }, { status: 400 });
  }
}
