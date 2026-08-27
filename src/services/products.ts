import { prisma } from "@/lib/db";
import { orderNumber } from "@/lib/order-status";

export async function getProducts(filters?: { filter?: string }) {
  const where: Record<string, unknown> = { active: true };
  if (filters?.filter === "popular") where.bestSeller = true;
  if (filters?.filter === "new") where.isNew = true;

  return prisma.product.findMany({
    where,
    include: { sizes: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { sizes: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getFeaturedProducts(limit = 4) {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    include: { sizes: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
}

export async function getBestSellers(limit = 4) {
  return prisma.product.findMany({
    where: { active: true, bestSeller: true },
    include: { sizes: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
}

export type ProductDTO = Awaited<ReturnType<typeof getProducts>>[number];

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
