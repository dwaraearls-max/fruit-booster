/**
 * Keep only the 18 official Fruit Booster menu products.
 * Removes old / duplicate / Booster Juice leftovers from the admin catalog.
 */
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const { SMOOTHIE_MENU } = require("../src/lib/smoothie-menu.ts");

function loadEnv(file) {
  const p = path.join(__dirname, "..", file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(".env.local");
loadEnv(".env");

const prisma = new PrismaClient();

async function main() {
  // Prefer TS menu via dynamic import of compiled values — fallback hardcode from menu file
  let keepSlugs;
  try {
    keepSlugs = SMOOTHIE_MENU.map((f) => f.slug);
  } catch {
    keepSlugs = null;
  }

  if (!keepSlugs) {
    const menuPath = path.join(__dirname, "../src/lib/smoothie-menu.ts");
    const text = fs.readFileSync(menuPath, "utf8");
    keepSlugs = [...text.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  }

  const keep = new Set(keepSlugs);
  const all = await prisma.product.findMany({ select: { id: true, name: true, slug: true } });
  const remove = all.filter((p) => !keep.has(p.slug));

  console.log("Keep:", keep.size, "menu slugs");
  console.log("Found:", all.length, "products");
  console.log("Removing:", remove.length);

  for (const p of remove) {
    console.log(" -", p.name, `(${p.slug})`);
  }

  if (!remove.length) {
    console.log("Nothing to remove.");
    return;
  }

  const ids = remove.map((p) => p.id);

  await prisma.cartItem.deleteMany({ where: { productId: { in: ids } } });
  await prisma.orderItem.updateMany({
    where: { productId: { in: ids } },
    data: { productId: null, sizeId: null },
  });
  await prisma.productSize.deleteMany({ where: { productId: { in: ids } } });
  const deleted = await prisma.product.deleteMany({ where: { id: { in: ids } } });

  console.log("Deleted", deleted.count, "unwanted products.");

  const remaining = await prisma.product.count();
  console.log("Remaining products:", remaining);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
