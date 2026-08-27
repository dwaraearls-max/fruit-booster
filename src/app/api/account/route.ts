import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  const orderNumber = searchParams.get("orderNumber");
  if (!phone || !orderNumber) {
    return NextResponse.json({ success: false, message: "Phone and order number required." }, { status: 400 });
  }
  const order = await prisma.order.findFirst({
    where: { phone: { contains: phone.replace(/\D/g, "").slice(-9) }, orderNumber },
  });
  if (!order) {
    return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: order });
}
