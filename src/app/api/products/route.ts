import { NextResponse } from "next/server";
import { getProducts, serializeProduct } from "@/services/products";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || undefined;
    const products = await getProducts({ filter: filter || undefined });
    return NextResponse.json({
      success: true,
      data: products.map(serializeProduct),
    });
  } catch {
    return NextResponse.json({ success: false, message: "Could not load products." }, { status: 500 });
  }
}
