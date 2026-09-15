import { cookies } from "next/headers";
import { createId, nowIso } from "@/lib/ids";
import { getSupabaseAdmin } from "@/lib/supabase";

const CART_COOKIE = "ff_cart_id";

type CartProduct = {
  slug: string;
  name: string;
  imageUrl: string;
  active: boolean;
  available: boolean;
};

type CartSize = {
  label: string;
  priceGhs: number;
  available: boolean;
};

type CartItemRow = {
  id: string;
  productId: string;
  sizeId: string;
  quantity: number;
  createdAt: string;
  product: CartProduct;
  size: CartSize;
};

const CART_WITH_ITEMS = `
  *,
  items:CartItem(
    *,
    product:Product(*),
    size:ProductSize(*)
  )
`;

export async function getCartId(): Promise<string> {
  const jar = await cookies();
  const cartId = jar.get(CART_COOKIE)?.value;
  const sb = getSupabaseAdmin();

  if (cartId) {
    const { data: existing } = await sb
      .from("Cart")
      .select("id")
      .eq("id", cartId)
      .maybeSingle();
    if (existing) return cartId;
  }

  const id = createId();
  const ts = nowIso();
  const { error } = await sb.from("Cart").insert({ id, updatedAt: ts });
  if (error) throw new Error(error.message);

  jar.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return id;
}

export async function getCartWithItems(cartId: string): Promise<{
  id: string;
  items: CartItemRow[];
} | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("Cart")
    .select(CART_WITH_ITEMS)
    .eq("id", cartId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const items = ([...(data.items || [])] as CartItemRow[]).sort((a, b) =>
    String(a.createdAt).localeCompare(String(b.createdAt)),
  );
  return { id: data.id as string, items };
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
