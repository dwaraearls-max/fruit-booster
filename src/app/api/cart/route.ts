import { NextResponse } from "next/server";
import { getCartId, getCartWithItems, mapCartLines, cartTotals } from "@/services/cart";

export async function GET() {
  try {
    const cartId = await getCartId();
    const cart = await getCartWithItems(cartId);
    const lines = cart ? mapCartLines(cart) : [];
    const totals = cartTotals(lines);
    return NextResponse.json({ success: true, data: { lines, ...totals } });
  } catch {
    return NextResponse.json({ success: false, message: "Could not load cart." }, { status: 500 });
  }
}
