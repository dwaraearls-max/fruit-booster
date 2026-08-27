import { getProducts, serializeProduct } from "@/services/products";
import { ShopClient } from "@/components/ShopClient";

export const metadata = {
  title: "Shop All Smoothies",
  description: "Order FruitFusion signature smoothie blends. 100% natural fruit, fast delivery in Ghana.",
};

export default async function ShopPage() {
  const products = (await getProducts()).map(serializeProduct);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h1 className="text-center text-4xl font-black text-plum">SHOP ALL SMOOTHIES</h1>
      <p className="mt-3 text-center text-plum/70">
        Choose your blend, pick your size, and order in seconds.
      </p>
      <ShopClient products={products} />
    </div>
  );
}
