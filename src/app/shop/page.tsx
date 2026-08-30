import { getProducts, serializeProduct } from "@/services/products";
import { ShopClient } from "@/components/ShopClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Menu — Smoothies",
  description:
    "Fruit Booster smoothie menu — refreshing blends made fresh with natural fruit. Fast delivery in Ghana.",
};

export default async function ShopPage() {
  let products: ReturnType<typeof serializeProduct>[] = [];
  try {
    products = (await getProducts()).map(serializeProduct);
  } catch (error) {
    console.error("Shop page data load failed:", error);
  }

  return <ShopClient products={products} />;
}
