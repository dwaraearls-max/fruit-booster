import { z } from "zod";
import { NextResponse } from "next/server";
import { getAdminSession, canManageSettings } from "@/services/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const zones = await prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ success: true, data: zones });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session || !canManageSettings(session.role)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = z
      .object({
        name: z.string(),
        deliveryFeeGhs: z.number(),
        estimatedMins: z.number().default(45),
      })
      .parse(await req.json());
    const zone = await prisma.deliveryZone.create({ data: body });
    return NextResponse.json({ success: true, data: zone });
  } catch {
    return NextResponse.json({ success: false, message: "Could not create zone." }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session || !canManageSettings(session.role)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = z
      .object({
        id: z.string(),
        name: z.string().optional(),
        deliveryFeeGhs: z.number().optional(),
        active: z.boolean().optional(),
      })
      .parse(await req.json());
    const { id, ...data } = body;
    const zone = await prisma.deliveryZone.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: zone });
  } catch {
    return NextResponse.json({ success: false, message: "Could not update zone." }, { status: 400 });
  }
}
