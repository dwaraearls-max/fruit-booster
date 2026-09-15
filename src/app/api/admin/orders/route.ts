import { z } from "zod";
import { NextResponse } from "next/server";
import { ORDER_STATUS_VALUES } from "@/lib/enums";
import { nowIso } from "@/lib/ids";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAdminSession } from "@/services/auth";
import { updateOrderStatus } from "@/services/orders";
import { getOrdersByStatus } from "@/services/admin";

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
      .object({
        orderId: z.string(),
        status: z.enum(ORDER_STATUS_VALUES),
        note: z.string().optional(),
      })
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
    const sb = getSupabaseAdmin();
    const { data: order, error } = await sb
      .from("Order")
      .select("*, items:OrderItem(*)")
      .eq("id", orderId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }
    const { data: updated, error: updateError } = await sb
      .from("Order")
      .update({
        paymentStatus: "SUCCESS",
        orderStatus: order.orderStatus === "NEW" ? "PAYMENT_CONFIRMED" : order.orderStatus,
        updatedAt: nowIso(),
      })
      .eq("id", orderId)
      .select("*")
      .single();
    if (updateError) throw new Error(updateError.message);
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, message: "Could not confirm payment." }, { status: 400 });
  }
}
