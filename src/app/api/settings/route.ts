import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const sb = getSupabaseAdmin();
    const [zonesRes, pickupRes, settingsRes] = await Promise.all([
      sb
        .from("DeliveryZone")
        .select("*")
        .eq("active", true)
        .order("sortOrder", { ascending: true }),
      sb
        .from("PickupLocation")
        .select("*")
        .eq("active", true)
        .order("sortOrder", { ascending: true }),
      sb.from("SiteSettings").select("*").eq("id", "default").maybeSingle(),
    ]);
    if (zonesRes.error || pickupRes.error || settingsRes.error) {
      throw new Error(
        zonesRes.error?.message ||
          pickupRes.error?.message ||
          settingsRes.error?.message ||
          "settings error",
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        zones: zonesRes.data,
        pickupLocations: pickupRes.data,
        settings: settingsRes.data,
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Could not load settings." }, { status: 500 });
  }
}
