import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCartId, getCartWithItems, mapCartLines, cartTotals } from "@/services/cart";

const schema = z.object({
  productId: z.string(),
  sizeId: z.string(),
  quantity: z.number().int().min(1).max(20).default(1),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const product = await prisma.product.findUnique({
      where: { id: body.productId },
      include: { sizes: true },
    });
    if (!product || !product.active || !product.available) {
      return NextResponse.json(
        { success: false, message: "This flavour is currently unavailable." },
        { status: 400 },
      );
    }
    const size = product.sizes.find((s) => s.id === body.sizeId);
    if (!size || !size.available) {
      return NextResponse.json(
        { success: false, message: "This size is currently unavailable." },
        { status: 400 },
      );
    }

    const cartId = await getCartId();
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_sizeId: {
          cartId,
          productId: body.productId,
          sizeId: body.sizeId,
        },
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(20, existing.quantity + body.quantity) },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId,
          productId: body.productId,
          sizeId: body.sizeId,
          quantity: body.quantity,
        },
      });
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

    if (body.quantity === 0) {
      await prisma.cartItem.deleteMany({ where: { id: body.itemId, cartId } });
    } else {
      await prisma.cartItem.updateMany({
        where: { id: body.itemId, cartId },
        data: { quantity: body.quantity },
      });
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
    if (itemId) {
      await prisma.cartItem.deleteMany({ where: { id: itemId, cartId } });
    } else {
      await prisma.cartItem.deleteMany({ where: { cartId } });
    }
    return NextResponse.json({ success: true, data: { lines: [], subtotalGhs: 0, itemCount: 0 } });
  } catch {
    return NextResponse.json({ success: false, message: "Could not remove item." }, { status: 400 });
  }
}
