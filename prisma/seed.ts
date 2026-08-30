import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BRAND } from "../src/lib/site-content";
import { SMOOTHIE_MENU } from "../src/lib/smoothie-menu";

const prisma = new PrismaClient();

async function seedProducts() {
  const slugs = SMOOTHIE_MENU.map((f) => f.slug);

  for (const flavour of SMOOTHIE_MENU) {
    const { isNew, bestSeller, featured, ...data } = flavour;
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        description: data.description,
        flavour: data.flavour,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder,
        category: "smoothie",
        active: true,
        available: true,
        bestSeller: bestSeller ?? false,
        featured: featured ?? false,
        isNew: isNew ?? false,
      },
      create: {
        ...data,
        category: "smoothie",
        bestSeller: bestSeller ?? false,
        featured: featured ?? false,
        isNew: isNew ?? false,
      },
    });

    const sizeCount = await prisma.productSize.count({ where: { productId: product.id } });
    if (sizeCount === 0) {
      await prisma.productSize.create({
        data: {
          productId: product.id,
          name: "regular",
          label: "Regular",
          priceGhs: 100,
          sortOrder: 1,
        },
      });
    }
  }

  await prisma.product.updateMany({
    where: { slug: { notIn: slugs } },
    data: { active: false, available: false },
  });

  console.log(`Synced ${SMOOTHIE_MENU.length} smoothie products.`);
}

async function main() {
  await seedProducts();

  const zones = [
    { name: "Accra Central", deliveryFeeGhs: 15, estimatedMins: 35, sortOrder: 1 },
    { name: "East Legon", deliveryFeeGhs: 20, estimatedMins: 40, sortOrder: 2 },
    { name: "Osu", deliveryFeeGhs: 18, estimatedMins: 35, sortOrder: 3 },
    { name: "Madina", deliveryFeeGhs: 22, estimatedMins: 45, sortOrder: 4 },
    { name: "Tema", deliveryFeeGhs: 30, estimatedMins: 55, sortOrder: 5 },
    { name: "Other Accra", deliveryFeeGhs: 25, estimatedMins: 50, sortOrder: 6 },
  ];

  for (const zone of zones) {
    await prisma.deliveryZone.upsert({
      where: { name: zone.name },
      update: zone,
      create: zone,
    });
  }

  const pickupCount = await prisma.pickupLocation.count();
  if (pickupCount === 0) {
    await prisma.pickupLocation.create({
      data: {
        name: "Fruit Booster Store",
        address: "Accra, Ghana",
        instructions: "Collect your smoothie at the counter. Please bring your order number.",
        sortOrder: 1,
      },
    });
  } else {
    await prisma.pickupLocation.updateMany({
      where: { name: { in: ["Fruit Fusion Store", "FruitFusionX Store"] } },
      data: { name: "Fruit Booster Store" },
    });
  }

  await prisma.promoCode.upsert({
    where: { code: "FUSION10" },
    update: {},
    create: {
      code: "FUSION10",
      type: "PERCENT",
      value: 10,
      minOrderGhs: 50,
      usageLimit: 100,
    },
  });

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

  const adminEmail = process.env.ADMIN_EMAIL || "admin@fruitfusion.gh";
  const adminPassword = process.env.ADMIN_PASSWORD || "FruitFusion2026!";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        fullName: "Fruit Booster Admin",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: UserRole.SUPER_ADMIN,
      },
    });
    console.log(`Created admin ${adminEmail}`);
  } else if (existingAdmin.fullName.includes("FruitFusion") || existingAdmin.fullName.includes("Fruit Fusion")) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { fullName: "Fruit Booster Admin" },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
