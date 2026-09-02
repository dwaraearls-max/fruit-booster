import { prisma } from "@/lib/db";
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
    return await prisma.siteSettings.findUnique({ where: { id: "default" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown";
    console.warn("[db] siteSettings unavailable:", msg.split("\n")[0]);
    return null;
  }
}
