import { z } from "zod";
import { NextResponse } from "next/server";
import { getAdminSession, canManageProducts } from "@/services/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    include: { sizes: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session || !canManageProducts(session.role)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = z
      .object({
        name: z.string(),
        slug: z.string(),
        description: z.string(),
        flavour: z.string(),
        imageUrl: z.string(),
        sizes: z.array(
          z.object({ name: z.string(), label: z.string(), priceGhs: z.number(), sortOrder: z.number() }),
        ),
      })
      .parse(await req.json());

    const product = await prisma.product.create({
      data: {
        ...body,
        sizes: { create: body.sizes },
      },
      include: { sizes: true },
    });
    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ success: false, message: "Could not create product." }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = z
      .object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        priceGhs: z.number().optional(),
        sizeId: z.string().optional(),
        available: z.boolean().optional(),
        bestSeller: z.boolean().optional(),
        featured: z.boolean().optional(),
        isNew: z.boolean().optional(),
        active: z.boolean().optional(),
      })
      .parse(await req.json());

    if (body.sizeId && body.priceGhs !== undefined && canManageProducts(session.role)) {
      await prisma.productSize.update({
        where: { id: body.sizeId },
        data: { priceGhs: body.priceGhs },
      });
    }

    const { id, ...updates } = body;
    const product = await prisma.product.update({
      where: { id },
      data: updates,
      include: { sizes: true },
    });
    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ success: false, message: "Could not update product." }, { status: 400 });
  }
}
