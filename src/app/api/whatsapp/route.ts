import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCartId, getCartWithItems, mapCartLines, cartTotals } from "@/services/cart";
import { buildWhatsAppOrderMessage } from "@/services/orders";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderToken = searchParams.get("order");

    if (orderToken) {
      const order = await prisma.order.findUnique({
        where: { publicToken: orderToken },
        include: { items: true },
      });
      if (!order) {
        return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: { message: buildWhatsAppOrderMessage(order) },
      });
    }

    const cartId = await getCartId();
    const cart = await getCartWithItems(cartId);
    const lines = cart ? mapCartLines(cart) : [];
    if (lines.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty." }, { status: 400 });
    }

    const totals = cartTotals(lines);
    const message = [
      "Hello Fruit Booster 👋",
      "",
      "I'd like to order:",
      "",
      ...lines.map((l) => `🍹 ${l.name} × ${l.quantity}`),
      "",
      `Total: GH₵${totals.subtotalGhs.toFixed(2)}`,
    ].join("\n");

    return NextResponse.json({ success: true, data: { message } });
  } catch {
    return NextResponse.json({ success: false, message: "Could not build message." }, { status: 500 });
  }
}
