import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const CART_COOKIE = "ff_cart_id";

export async function getCartId(): Promise<string> {
  const jar = await cookies();
  const cartId = jar.get(CART_COOKIE)?.value;

  if (cartId) {
    const existing = await prisma.cart.findUnique({ where: { id: cartId } });
    if (existing) return cartId;
  }

  const cart = await prisma.cart.create({ data: {} });
  jar.set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return cart.id;
}

export async function getCartWithItems(cartId: string) {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
          size: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export type CartLine = {
  id: string;
  productId: string;
  sizeId: string;
  slug: string;
  name: string;
  sizeLabel: string;
  imageUrl: string;
  quantity: number;
  unitPriceGhs: number;
  subtotalGhs: number;
  available: boolean;
};

export function mapCartLines(
  cart: NonNullable<Awaited<ReturnType<typeof getCartWithItems>>>,
): CartLine[] {
  return cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    sizeId: item.sizeId,
    slug: item.product.slug,
    name: item.product.name,
    sizeLabel: item.size.label,
    imageUrl: item.product.imageUrl,
    quantity: item.quantity,
    unitPriceGhs: item.size.priceGhs,
    subtotalGhs: item.size.priceGhs * item.quantity,
    available: item.product.active && item.product.available && item.size.available,
  }));
}

export function cartTotals(lines: CartLine[]) {
  const subtotalGhs = lines.reduce((s, l) => s + l.subtotalGhs, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  return { subtotalGhs, itemCount };
}
