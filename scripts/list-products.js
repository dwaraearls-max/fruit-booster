const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

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
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      available: true,
      active: true,
      imageUrl: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: "asc" },
  });
  console.log(JSON.stringify(products, null, 2));
  console.log("COUNT", products.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
