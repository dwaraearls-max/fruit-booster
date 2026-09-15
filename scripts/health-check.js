const path = require("path");
const fs = require("fs");

function loadEnv(file) {
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
    if (!process.env[m[1].trim()]) process.env[m[1].trim()] = v;
  }
}

loadEnv(".env.local");
loadEnv(".env");

const { createClient } = require("@supabase/supabase-js");

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("FAIL: missing Supabase env");
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const checks = [];

  const products = await sb
    .from("Product")
    .select("id, slug, active, sizes:ProductSize(id, priceGhs)")
    .eq("active", true);
  checks.push({
    name: "products",
    ok: !products.error && (products.data?.length || 0) >= 18,
    detail: products.error?.message || `${products.data?.length} active`,
  });

  const zones = await sb
    .from("DeliveryZone")
    .select("id")
    .eq("active", true);
  checks.push({
    name: "deliveryZones",
    ok: !zones.error && (zones.data?.length || 0) > 0,
    detail: zones.error?.message || `${zones.data?.length} zones`,
  });

  const settings = await sb
    .from("SiteSettings")
    .select("id, businessName")
    .eq("id", "default")
    .maybeSingle();
  checks.push({
    name: "siteSettings",
    ok: !settings.error && !!settings.data,
    detail: settings.error?.message || settings.data?.businessName || "missing",
  });

  const admin = await sb
    .from("User")
    .select("id, email, role")
    .eq("email", process.env.ADMIN_EMAIL || "admin@fruitfusion.gh")
    .maybeSingle();
  checks.push({
    name: "adminUser",
    ok: !admin.error && !!admin.data,
    detail: admin.error?.message || `${admin.data?.email} (${admin.data?.role})`,
  });

  const cart = await sb.from("Cart").select("id").limit(1);
  checks.push({
    name: "cartTable",
    ok: !cart.error,
    detail: cart.error?.message || "readable",
  });

  let failed = 0;
  for (const c of checks) {
    console.log(`${c.ok ? "OK" : "FAIL"}  ${c.name}: ${c.detail}`);
    if (!c.ok) failed++;
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error("FAIL:", e.message || e);
  process.exit(1);
});
