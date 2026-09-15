import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  const orderNumber = searchParams.get("orderNumber");
  if (!phone || !orderNumber) {
    return NextResponse.json(
      { success: false, message: "Phone and order number required." },
      { status: 400 },
    );
  }

  const digits = phone.replace(/\D/g, "").slice(-9);
  const sb = getSupabaseAdmin();
  const { data: orders, error } = await sb
    .from("Order")
    .select("*")
    .eq("orderNumber", orderNumber);
  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  const order = (orders || []).find((o) => String(o.phone).replace(/\D/g, "").includes(digits));
  if (!order) {
    return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: order });
}
