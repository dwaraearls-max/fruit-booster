import { getSupabaseAdmin, isDbUnreachable } from "@/lib/supabase";
import { BRAND } from "@/lib/site-content";

export const SETTINGS_FALLBACK = {
  tagline: BRAND.tagline,
  phone: BRAND.phone,
  email: BRAND.email,
  hoursWeekday: "Mon–Sat: 9:00 AM – 8:00 PM",
  hoursSunday: "Sun: 10:00 AM – 6:00 PM",
} as const;

/** Load site settings; never throws — storefront stays up if Supabase is briefly unreachable. */
export async function getSiteSettings() {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("SiteSettings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown";
    console.warn("[db] siteSettings unavailable:", msg.split("\n")[0]);
    if (!isDbUnreachable(error)) {
      console.warn("[db] siteSettings error detail:", msg);
    }
    return null;
  }
}
