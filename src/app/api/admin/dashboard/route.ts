import { NextResponse } from "next/server";
import { getAdminSession } from "@/services/auth";
import { getDashboardStats } from "@/services/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const stats = await getDashboardStats();
  return NextResponse.json({ success: true, data: stats });
}
