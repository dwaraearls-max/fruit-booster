import { z } from "zod";
import { NextResponse } from "next/server";
import { createId, nowIso } from "@/lib/ids";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAdminSession, canManageProducts } from "@/services/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("Product")
    .select("*, sizes:ProductSize(*)")
    .eq("active", true)
    .order("sortOrder", { ascending: true });
  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  const products = (data || []).map((p) => ({
    ...p,
    sizes: [...(p.sizes || [])].sort(
      (a: { sortOrder?: number }, b: { sortOrder?: number }) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    ),
  }));
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
          z.object({
            name: z.string(),
            label: z.string(),
            priceGhs: z.number(),
            sortOrder: z.number(),
          }),
        ),
      })
      .parse(await req.json());

    const sb = getSupabaseAdmin();
    const ts = nowIso();
    const productId = createId();
    const { data: product, error } = await sb
      .from("Product")
      .insert({
        id: productId,
        name: body.name,
        slug: body.slug,
        description: body.description,
        flavour: body.flavour,
        imageUrl: body.imageUrl,
        updatedAt: ts,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const sizes = body.sizes.map((s) => ({
      id: createId(),
      productId,
      name: s.name,
      label: s.label,
      priceGhs: s.priceGhs,
      sortOrder: s.sortOrder,
    }));
    const { error: sizeError } = await sb.from("ProductSize").insert(sizes);
    if (sizeError) throw new Error(sizeError.message);

    return NextResponse.json({ success: true, data: { ...product, sizes } });
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

    const sb = getSupabaseAdmin();
    const ts = nowIso();

    if (body.sizeId && body.priceGhs !== undefined && canManageProducts(session.role)) {
      const { error } = await sb
        .from("ProductSize")
        .update({ priceGhs: body.priceGhs })
        .eq("id", body.sizeId);
      if (error) throw new Error(error.message);
    }

    const { id, sizeId: _ignoredSizeId, priceGhs: _ignoredPriceGhs, ...updates } = body;
    void _ignoredSizeId;
    void _ignoredPriceGhs;
    const { data: product, error } = await sb
      .from("Product")
      .update({ ...updates, updatedAt: ts })
      .eq("id", id)
      .select("*, sizes:ProductSize(*)")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ success: false, message: "Could not update product." }, { status: 400 });
  }
}
