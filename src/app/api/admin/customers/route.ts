import { NextResponse } from "next/server";
import { getAdminSession } from "@/services/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const customers = await prisma.customer.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      orderCount: true,
      totalSpentGhs: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, data: customers });
}
