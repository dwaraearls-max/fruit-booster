import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BRAND } from "../src/lib/site-content";

const prisma = new PrismaClient();

const FLAVOURS = [
  {
    name: "Strawberry Fusion",
    slug: "strawberry-fusion",
    flavour: "strawberry",
    description: "Freshly blended strawberry juice with a naturally fruity taste.",
    imageUrl: "/products/strawberry-fusion.jpg",
    bestSeller: true,
    featured: true,
    sortOrder: 1,
  },
  {
    name: "Mango Passion",
    slug: "mango-passion",
    flavour: "mango",
    description: "Tropical mango blended smooth for a golden, sunny sip.",
    imageUrl: "/products/mango-passion.jpg",
    bestSeller: true,
    featured: true,
    sortOrder: 2,
  },
  {
    name: "Pineapple Ginger",
    slug: "pineapple-ginger",
    flavour: "pineapple",
    description: "Bright pineapple with a gentle ginger kick.",
    imageUrl: "/products/pineapple-ginger.jpg",
    featured: true,
    sortOrder: 3,
  },
  {
    name: "Watermelon Mint",
    slug: "watermelon-mint",
    flavour: "watermelon",
    description: "Cool watermelon refreshed with garden mint.",
    imageUrl: "/products/watermelon-mint.jpg",
    isNew: true,
    sortOrder: 4,
  },
  {
    name: "Mixed Berry",
    slug: "mixed-berry",
    flavour: "berry",
    description: "A vibrant blend of Ghana's finest berries.",
    imageUrl: "/products/mixed-berry.jpg",
    bestSeller: true,
    sortOrder: 5,
  },
  {
    name: "Tropical Glow",
    slug: "tropical-glow",
    flavour: "tropical",
    description: "Passion fruit, pineapple and citrus in one radiant cup.",
    imageUrl: "/products/tropical-glow.jpg",
    sortOrder: 6,
  },
  {
    name: "Citrus Burst",
    slug: "citrus-burst",
    flavour: "citrus",
    description: "Orange and lemon zesty refreshment.",
    imageUrl: "/products/citrus-burst.jpg",
    isNew: true,
    sortOrder: 7,
  },
  {
    name: "Green Vitality",
    slug: "green-vitality",
    flavour: "green",
    description: "Spinach, apple and pineapple for clean energy.",
    imageUrl: "/products/green-vitality.jpg",
    sortOrder: 8,
  },
];

const SIZE_PRICES = [
  { name: "regular", label: "Regular", priceGhs: 100, sortOrder: 1 },
];

const ZONES = [
  { name: "Accra Central", deliveryFeeGhs: 15, estimatedMins: 35, sortOrder: 1 },
  { name: "East Legon", deliveryFeeGhs: 20, estimatedMins: 40, sortOrder: 2 },
  { name: "Osu", deliveryFeeGhs: 18, estimatedMins: 35, sortOrder: 3 },
  { name: "Madina", deliveryFeeGhs: 22, estimatedMins: 45, sortOrder: 4 },
  { name: "Tema", deliveryFeeGhs: 30, estimatedMins: 55, sortOrder: 5 },
  { name: "Other Accra", deliveryFeeGhs: 25, estimatedMins: 50, sortOrder: 6 },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.deliveryZone.deleteMany();
  await prisma.pickupLocation.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.customer.deleteMany();

  for (const flavour of FLAVOURS) {
    const { isNew, bestSeller, featured, ...data } = flavour;
    await prisma.product.create({
      data: {
        ...data,
        bestSeller: bestSeller ?? false,
        featured: featured ?? false,
        isNew: isNew ?? false,
        sizes: {
          create: SIZE_PRICES,
        },
      },
    });
  }

  for (const zone of ZONES) {
    await prisma.deliveryZone.create({ data: zone });
  }

  await prisma.pickupLocation.create({
    data: {
      name: "Fruit Fusion Store",
      address: "East Legon, Accra, Ghana",
      instructions: "Collect your juice at the counter. Please bring your order number.",
      sortOrder: 1,
    },
  });

  await prisma.promoCode.create({
    data: {
      code: "FUSION10",
      type: "PERCENT",
      value: 10,
      minOrderGhs: 50,
      usageLimit: 100,
    },
  });

  const siteSettings = {
    businessName: BRAND.name,
    tagline: BRAND.tagline,
    email: BRAND.email,
    phone: BRAND.phone,
    whatsapp: BRAND.whatsapp,
    instagram: BRAND.instagram,
    tiktok: BRAND.tiktok,
  };

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: siteSettings,
    create: siteSettings,
  });

  const adminEmail = process.env.ADMIN_EMAIL || "admin@fruitfusion.gh";
  const adminPassword = process.env.ADMIN_PASSWORD || "FruitFusion2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      fullName: "Fruit Fusion Admin",
      email: adminEmail,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
    },
  });

  console.log("Seeded 8 flavours, delivery zones, admin user, and site settings.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
