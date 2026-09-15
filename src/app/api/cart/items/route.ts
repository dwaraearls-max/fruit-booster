import { z } from "zod";
import { NextResponse } from "next/server";
import { createId, nowIso } from "@/lib/ids";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getCartId, getCartWithItems, mapCartLines, cartTotals } from "@/services/cart";

const schema = z.object({
  productId: z.string(),
  sizeId: z.string(),
  quantity: z.number().int().min(1).max(20).default(1),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const sb = getSupabaseAdmin();
    const { data: product, error } = await sb
      .from("Product")
      .select("*, sizes:ProductSize(*)")
      .eq("id", body.productId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!product || !product.active || !product.available) {
      return NextResponse.json(
        { success: false, message: "This flavour is currently unavailable." },
        { status: 400 },
      );
    }
    const size = (product.sizes || []).find((s: { id: string }) => s.id === body.sizeId);
    if (!size || !size.available) {
      return NextResponse.json(
        { success: false, message: "This size is currently unavailable." },
        { status: 400 },
      );
    }

    const cartId = await getCartId();
    const { data: existing } = await sb
      .from("CartItem")
      .select("*")
      .eq("cartId", cartId)
      .eq("productId", body.productId)
      .eq("sizeId", body.sizeId)
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await sb
        .from("CartItem")
        .update({
          quantity: Math.min(20, existing.quantity + body.quantity),
          updatedAt: nowIso(),
        })
        .eq("id", existing.id);
      if (updateError) throw new Error(updateError.message);
    } else {
      const { error: insertError } = await sb.from("CartItem").insert({
        id: createId(),
        cartId,
        productId: body.productId,
        sizeId: body.sizeId,
        quantity: body.quantity,
        updatedAt: nowIso(),
      });
      if (insertError) throw new Error(insertError.message);
    }

    const cart = await getCartWithItems(cartId);
    const lines = cart ? mapCartLines(cart) : [];
    const totals = cartTotals(lines);

    return NextResponse.json({
      success: true,
      data: {
        message: `${product.name} added to your order!`,
        lines,
        ...totals,
      },
    });
  } catch (e) {
    const message = e instanceof z.ZodError ? "Invalid cart request." : "Could not add to cart.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = z
      .object({ itemId: z.string(), quantity: z.number().int().min(0).max(20) })
      .parse(await req.json());
    const cartId = await getCartId();
    const sb = getSupabaseAdmin();

    if (body.quantity === 0) {
      await sb.from("CartItem").delete().eq("id", body.itemId).eq("cartId", cartId);
    } else {
      await sb
        .from("CartItem")
        .update({ quantity: body.quantity, updatedAt: nowIso() })
        .eq("id", body.itemId)
        .eq("cartId", cartId);
    }

    const cart = await getCartWithItems(cartId);
    const lines = cart ? mapCartLines(cart) : [];
    return NextResponse.json({ success: true, data: { lines, ...cartTotals(lines) } });
  } catch {
    return NextResponse.json({ success: false, message: "Could not update cart." }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const cartId = await getCartId();
    const sb = getSupabaseAdmin();
    if (itemId) {
      await sb.from("CartItem").delete().eq("id", itemId).eq("cartId", cartId);
    } else {
      await sb.from("CartItem").delete().eq("cartId", cartId);
    }
    return NextResponse.json({ success: true, data: { lines: [], subtotalGhs: 0, itemCount: 0 } });
  } catch {
    return NextResponse.json({ success: false, message: "Could not remove item." }, { status: 400 });
  }
}
