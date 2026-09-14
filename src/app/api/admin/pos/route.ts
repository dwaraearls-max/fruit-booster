import { z } from "zod";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/services/auth";
import { createPosOrder } from "@/services/admin";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = z
      .object({
        customerName: z.string().min(1).max(80),
        phone: z.string().optional(),
        paymentMethod: z.enum(["cash", "momo"]),
        note: z.string().max(200).optional(),
        items: z
          .array(
            z.object({
              productId: z.string(),
              sizeId: z.string(),
              quantity: z.number().int().min(1).max(20),
            }),
          )
          .min(1),
      })
      .parse(await req.json());

    const order = await createPosOrder(body);
    return NextResponse.json({ success: true, data: order });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create POS order.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
