import { prisma } from "../src/lib/db";

async function main() {
  const products = await prisma.product.findMany({
    include: { sizes: { orderBy: { sortOrder: "asc" } } },
  });

  for (const product of products) {
    const keep = product.sizes[0];
    if (!keep) {
      await prisma.productSize.create({
        data: {
          productId: product.id,
          name: "regular",
          label: "Regular",
          priceGhs: 100,
          sortOrder: 1,
          available: true,
        },
      });
      continue;
    }

    await prisma.productSize.update({
      where: { id: keep.id },
      data: {
        name: "regular",
        label: "Regular",
        priceGhs: 100,
        sortOrder: 1,
        available: true,
      },
    });

    const extras = product.sizes.slice(1);
    for (const size of extras) {
      await prisma.cartItem.deleteMany({ where: { sizeId: size.id } });
      await prisma.orderItem.updateMany({
        where: { sizeId: size.id },
        data: { sizeId: null },
      });
      await prisma.productSize.delete({ where: { id: size.id } });
    }
  }

  console.log("All products set to GH₵100 with no size options.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
