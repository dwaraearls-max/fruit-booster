import { prisma } from "@/lib/db";
import { SMOOTHIE_MENU } from "@/lib/smoothie-menu";
import { orderNumber } from "@/lib/order-status";

const DEFAULT_PRICE_GHS = 100;

function isDbUnreachable(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return /can't reach database|timed out|p1001|p1017|econnrefused|enotfound/i.test(msg);
}

function warnDb(context: string, error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  console.warn(`[db] ${context}:`, msg.split("\n")[0]);
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
    sizes: [
      {
        id: `menu-${item.slug}-regular`,
        name: "REGULAR",
        label: "Regular",
        priceGhs: DEFAULT_PRICE_GHS,
        available: true,
        sortOrder: 0,
      },
    ],
  }));
}

export type ProductDTO = Awaited<ReturnType<typeof getMenuFallbackProducts>>[number];

export async function getProducts(filters?: { filter?: string }) {
  try {
    const where: Record<string, unknown> = { active: true };
    if (filters?.filter === "popular") where.bestSeller = true;
    if (filters?.filter === "new") where.isNew = true;

    return await prisma.product.findMany({
      where,
      include: { sizes: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });
  } catch (error) {
    warnDb("getProducts", error);
    if (isDbUnreachable(error)) return getMenuFallbackProducts(filters);
    throw error;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: { sizes: { orderBy: { sortOrder: "asc" } } },
    });
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
    return await prisma.product.findMany({
      where: { active: true, featured: true },
      include: { sizes: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
      take: limit,
    });
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
    return await prisma.product.findMany({
      where: { active: true, bestSeller: true },
      include: { sizes: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
      take: limit,
    });
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
  let num = orderNumber();
  let exists = await prisma.order.findUnique({ where: { orderNumber: num } });
  while (exists) {
    num = orderNumber();
    exists = await prisma.order.findUnique({ where: { orderNumber: num } });
  }
  return num;
}
