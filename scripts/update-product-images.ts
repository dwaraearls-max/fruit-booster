import { prisma } from "../src/lib/db";

const updates = [
  ["strawberry-fusion", "/products/strawberry-fusion.jpg"],
  ["mango-passion", "/products/mango-passion.jpg"],
  ["pineapple-ginger", "/products/pineapple-ginger.jpg"],
  ["watermelon-mint", "/products/watermelon-mint.jpg"],
  ["mixed-berry", "/products/mixed-berry.jpg"],
  ["tropical-glow", "/products/tropical-glow.jpg"],
  ["citrus-burst", "/products/citrus-burst.jpg"],
  ["green-vitality", "/products/green-vitality.jpg"],
] as const;

async function main() {
  for (const [slug, imageUrl] of updates) {
    await prisma.product.update({
      where: { slug },
      data: { imageUrl },
    });
  }
  console.log("Updated product images to flavour cup JPGs.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
