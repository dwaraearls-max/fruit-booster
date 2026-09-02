import { getProducts, serializeProduct } from "@/services/products";
import { ShopClient } from "@/components/ShopClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Menu — Smoothies",
  description:
    "Fruit Booster smoothie menu — refreshing blends made fresh with natural fruit. Fast delivery in Ghana.",
};

export default async function ShopPage() {
  const products = (await getProducts()).map(serializeProduct);
  return <ShopClient products={products} />;
}
