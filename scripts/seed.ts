/**
 * Seed Fruit Booster catalog via Supabase JS (service role).
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { BRAND } from "../src/lib/site-content";
import { SMOOTHIE_MENU } from "../src/lib/smoothie-menu";

function loadEnvFile(file: string) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    const key = m[1].trim();
    if (!process.env[key]) process.env[key] = v;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

function createId() {
  return `c${randomBytes(12).toString("hex")}`;
}

function nowIso() {
  return new Date().toISOString();
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

const sb = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function seedProducts() {
  const slugs = SMOOTHIE_MENU.map((f) => f.slug);
  const ts = nowIso();

  for (const flavour of SMOOTHIE_MENU) {
    const { isNew, bestSeller, featured, sizes: customSizes, ...data } = flavour;
    const { data: existing } = await sb
      .from("Product")
      .select("id")
      .eq("slug", data.slug)
      .maybeSingle();

    let productId = existing?.id as string | undefined;
    if (productId) {
      const { error } = await sb
        .from("Product")
        .update({
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
          updatedAt: ts,
        })
        .eq("id", productId);
      if (error) throw error;
    } else {
      productId = createId();
      const { error } = await sb.from("Product").insert({
        id: productId,
        ...data,
        category: "smoothie",
        bestSeller: bestSeller ?? false,
        featured: featured ?? false,
        isNew: isNew ?? false,
        updatedAt: ts,
      });
      if (error) throw error;
    }

    const desiredSizes = customSizes ?? [
      { name: "regular" as const, label: "Regular", priceGhs: 70, sortOrder: 1 },
      { name: "small" as const, label: "Small", priceGhs: 50, sortOrder: 2 },
    ];

    const { data: sizes } = await sb
      .from("ProductSize")
      .select("id, name")
      .eq("productId", productId);

    for (const want of desiredSizes) {
      const existing = (sizes || []).find((s) => {
        const n = String(s.name).toLowerCase();
        if (n === want.name) return true;
        // Migrate former "large" rows to "regular"
        if (want.name === "regular" && n === "large") return true;
        return false;
      });
      if (existing) {
        const { error } = await sb
          .from("ProductSize")
          .update({
            name: want.name,
            label: want.label,
            priceGhs: want.priceGhs,
            sortOrder: want.sortOrder,
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("ProductSize").insert({
          id: createId(),
          productId,
          name: want.name,
          label: want.label,
          priceGhs: want.priceGhs,
          sortOrder: want.sortOrder,
        });
        if (error) throw error;
      }
    }

    const kept = new Set(["small", "regular"]);
    const { data: afterSizes } = await sb
      .from("ProductSize")
      .select("id, name")
      .eq("productId", productId);
    const obsolete = (afterSizes || []).filter(
      (s) => !kept.has(String(s.name).toLowerCase()),
    );
    if (obsolete.length) {
      const obsoleteIds = obsolete.map((s) => s.id);
      await sb.from("CartItem").delete().in("sizeId", obsoleteIds);
      await sb.from("OrderItem").update({ sizeId: null }).in("sizeId", obsoleteIds);
      const { error } = await sb.from("ProductSize").delete().in("id", obsoleteIds);
      if (error) throw error;
    }
  }

  const { data: allProducts } = await sb.from("Product").select("id, slug");
  const extras = (allProducts || []).filter((p) => !slugs.includes(p.slug));
  const extraIds = extras.map((p) => p.id);
  if (extraIds.length) {
    await sb.from("CartItem").delete().in("productId", extraIds);
    await sb
      .from("OrderItem")
      .update({ productId: null, sizeId: null })
      .in("productId", extraIds);
    await sb.from("ProductSize").delete().in("productId", extraIds);
    await sb.from("Product").delete().in("id", extraIds);
  }

  console.log(
    `Synced ${SMOOTHIE_MENU.length} smoothie products. Removed ${extraIds.length} extras.`,
  );
}

async function main() {
  await seedProducts();
  const ts = nowIso();

  const zones = [
    { name: "Accra Central", deliveryFeeGhs: 15, estimatedMins: 35, sortOrder: 1 },
    { name: "East Legon", deliveryFeeGhs: 20, estimatedMins: 40, sortOrder: 2 },
    { name: "Osu", deliveryFeeGhs: 18, estimatedMins: 35, sortOrder: 3 },
    { name: "Madina", deliveryFeeGhs: 22, estimatedMins: 45, sortOrder: 4 },
    { name: "Tema", deliveryFeeGhs: 30, estimatedMins: 55, sortOrder: 5 },
    { name: "Other Accra", deliveryFeeGhs: 25, estimatedMins: 50, sortOrder: 6 },
  ];

  for (const zone of zones) {
    const { data: existing } = await sb
      .from("DeliveryZone")
      .select("id")
      .eq("name", zone.name)
      .maybeSingle();
    if (existing) {
      await sb
        .from("DeliveryZone")
        .update({ ...zone, updatedAt: ts })
        .eq("id", existing.id);
    } else {
      await sb.from("DeliveryZone").insert({ id: createId(), ...zone, updatedAt: ts });
    }
  }

  const { count: pickupCount } = await sb
    .from("PickupLocation")
    .select("id", { count: "exact", head: true });
  if (!pickupCount) {
    await sb.from("PickupLocation").insert({
      id: createId(),
      name: "Fruit Booster Store",
      address: "Accra, Ghana",
      instructions: "Collect your smoothie at the counter. Please bring your order number.",
      sortOrder: 1,
      updatedAt: ts,
    });
  } else {
    await sb
      .from("PickupLocation")
      .update({ name: "Fruit Booster Store", updatedAt: ts })
      .in("name", ["Fruit Fusion Store", "FruitFusionX Store"]);
  }

  const { data: promo } = await sb
    .from("PromoCode")
    .select("id")
    .eq("code", "FUSION10")
    .maybeSingle();
  if (!promo) {
    await sb.from("PromoCode").insert({
      id: createId(),
      code: "FUSION10",
      type: "PERCENT",
      value: 10,
      minOrderGhs: 50,
      usageLimit: 100,
      updatedAt: ts,
    });
  }

  const settingsPayload = {
    businessName: BRAND.name,
    tagline: BRAND.tagline,
    email: BRAND.email,
    phone: BRAND.phone,
    whatsapp: BRAND.whatsapp,
    instagram: BRAND.instagram,
    tiktok: BRAND.tiktok,
    updatedAt: ts,
  };
  const { data: settings } = await sb
    .from("SiteSettings")
    .select("id")
    .eq("id", "default")
    .maybeSingle();
  if (settings) {
    await sb.from("SiteSettings").update(settingsPayload).eq("id", "default");
  } else {
    await sb.from("SiteSettings").insert({ id: "default", ...settingsPayload });
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@fruitfusion.gh";
  const adminPassword = process.env.ADMIN_PASSWORD || "FruitFusion2026!";
  const { data: existingAdmin } = await sb
    .from("User")
    .select("id, fullName")
    .eq("email", adminEmail)
    .maybeSingle();
  if (!existingAdmin) {
    await sb.from("User").insert({
      id: createId(),
      fullName: "Fruit Booster Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "SUPER_ADMIN",
      updatedAt: ts,
    });
    console.log(`Created admin ${adminEmail}`);
  } else if (
    existingAdmin.fullName.includes("FruitFusion") ||
    existingAdmin.fullName.includes("Fruit Fusion")
  ) {
    await sb
      .from("User")
      .update({ fullName: "Fruit Booster Admin", updatedAt: ts })
      .eq("email", adminEmail);
  }

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
