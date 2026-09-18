import { getSupabaseAdmin, isDbUnreachable } from "@/lib/supabase";
import { SMOOTHIE_MENU } from "@/lib/smoothie-menu";
import { orderNumber } from "@/lib/order-status";

const DEFAULT_SIZES = [
  { name: "regular", label: "Regular", priceGhs: 70, sortOrder: 0 },
  { name: "small", label: "Small", priceGhs: 50, sortOrder: 1 },
] as const;

const PRODUCT_WITH_SIZES =
  "*, sizes:ProductSize(id, name, label, priceGhs, available, sortOrder, productId, sku)";

function warnDb(context: string, error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  console.warn(`[db] ${context}:`, msg.split("\n")[0]);
}

function sortSizes<T extends { sortOrder?: number | null }>(sizes: T[] | null | undefined) {
  return [...(sizes || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function normalizeProduct<T extends { sizes?: Array<{ sortOrder?: number | null }> | null }>(
  product: T,
) {
  return { ...product, sizes: sortSizes(product.sizes) };
}

/** Offline / DB-down catalog so the shop still shows the 18 cups. */
export function getMenuFallbackProducts(filters?: { filter?: string }) {
  let items = SMOOTHIE_MENU;
  if (filters?.filter === "popular") items = items.filter((i) => i.bestSeller);
  if (filters?.filter === "new") items = items.filter((i) => i.isNew);

  return items.map((item) => ({
    id: `menu-${item.slug}`,
    name: item.name,
    slug: item.slug,
    description: item.description,
    flavour: item.flavour,
    imageUrl: item.imageUrl,
    available: true,
    active: true,
    bestSeller: !!item.bestSeller,
    featured: !!item.featured,
    isNew: !!item.isNew,
    sortOrder: item.sortOrder,
    sizes: (item.sizes ?? DEFAULT_SIZES).map((size, index) => ({
      id: `menu-${item.slug}-${size.name}`,
      name: size.name.toUpperCase(),
      label: size.label,
      priceGhs: size.priceGhs,
      available: true,
      sortOrder: size.sortOrder ?? index,
    })),
  }));
}

export type ProductDTO = Awaited<ReturnType<typeof getMenuFallbackProducts>>[number];

export async function getProducts(filters?: { filter?: string }) {
  try {
    const sb = getSupabaseAdmin();
    let query = sb
      .from("Product")
      .select(PRODUCT_WITH_SIZES)
      .eq("active", true)
      .order("sortOrder", { ascending: true });

    if (filters?.filter === "popular") query = query.eq("bestSeller", true);
    if (filters?.filter === "new") query = query.eq("isNew", true);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map(normalizeProduct);
  } catch (error) {
    warnDb("getProducts", error);
    if (isDbUnreachable(error)) return getMenuFallbackProducts(filters);
    throw error;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("Product")
      .select(PRODUCT_WITH_SIZES)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? normalizeProduct(data) : null;
  } catch (error) {
    warnDb("getProductBySlug", error);
    if (isDbUnreachable(error)) {
      return getMenuFallbackProducts().find((p) => p.slug === slug) ?? null;
    }
    throw error;
  }
}

export async function getFeaturedProducts(limit = 4) {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("Product")
      .select(PRODUCT_WITH_SIZES)
      .eq("active", true)
      .eq("featured", true)
      .order("sortOrder", { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data || []).map(normalizeProduct);
  } catch (error) {
    warnDb("getFeaturedProducts", error);
    if (isDbUnreachable(error)) {
      return getMenuFallbackProducts()
        .filter((p) => p.featured)
        .slice(0, limit);
    }
    throw error;
  }
}

export async function getBestSellers(limit = 4) {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("Product")
      .select(PRODUCT_WITH_SIZES)
      .eq("active", true)
      .eq("bestSeller", true)
      .order("sortOrder", { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data || []).map(normalizeProduct);
  } catch (error) {
    warnDb("getBestSellers", error);
    if (isDbUnreachable(error)) {
      return getMenuFallbackProducts()
        .filter((p) => p.bestSeller)
        .slice(0, limit);
    }
    throw error;
  }
}

export function serializeProduct(p: ProductDTO) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    flavour: p.flavour,
    imageUrl: p.imageUrl,
    available: p.available && p.active,
    bestSeller: p.bestSeller,
    featured: p.featured,
    isNew: p.isNew,
    sizes: p.sizes
      .filter((s) => s.available)
      .map((s) => ({
        id: s.id,
        name: s.name,
        label: s.label,
        priceGhs: s.priceGhs,
      })),
  };
}

export async function getNextOrderNumber() {
  const sb = getSupabaseAdmin();
  let num = orderNumber();
  for (let i = 0; i < 20; i++) {
    const { data, error } = await sb
      .from("Order")
      .select("id")
      .eq("orderNumber", num)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return num;
    num = orderNumber();
  }
  return num;
}
