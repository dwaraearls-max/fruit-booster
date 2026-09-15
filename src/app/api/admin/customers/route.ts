import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAdminSession } from "@/services/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  const { data: customers, error } = await sb
    .from("Customer")
    .select("id, fullName, phone, email, orderCount, totalSpentGhs, createdAt")
    .order("updatedAt", { ascending: false })
    .limit(200);
  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: customers });
}
