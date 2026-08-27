import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [zones, pickupLocations, settings] = await Promise.all([
      prisma.deliveryZone.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.pickupLocation.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.siteSettings.findUnique({ where: { id: "default" } }),
    ]);
    return NextResponse.json({ success: true, data: { zones, pickupLocations, settings } });
  } catch {
    return NextResponse.json({ success: false, message: "Could not load settings." }, { status: 500 });
  }
}
