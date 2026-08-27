import { BRAND } from "../src/lib/site-content";
import { prisma } from "../src/lib/db";

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      businessName: BRAND.name,
      tagline: BRAND.tagline,
      email: BRAND.email,
      phone: BRAND.phone,
      whatsapp: BRAND.whatsapp,
      instagram: BRAND.instagram,
      tiktok: BRAND.tiktok,
    },
    create: {
      businessName: BRAND.name,
      tagline: BRAND.tagline,
      email: BRAND.email,
      phone: BRAND.phone,
      whatsapp: BRAND.whatsapp,
      instagram: BRAND.instagram,
      tiktok: BRAND.tiktok,
    },
  });
  console.log("Site settings updated.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
