import { getProducts, serializeProduct } from "@/services/products";
import { ShopClient } from "@/components/ShopClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop All Smoothies",
  description: "Order FruitFusionX signature smoothie blends. 100% natural fruit, fast delivery in Ghana.",
};

export default async function ShopPage() {
  let products: ReturnType<typeof serializeProduct>[] = [];
  try {
    products = (await getProducts()).map(serializeProduct);
  } catch (error) {
    console.error("Shop page data load failed:", error);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h1 className="text-center text-4xl font-black text-plum">SHOP ALL SMOOTHIES</h1>
      <p className="mt-3 text-center text-plum/70">
        Choose your blend and order in seconds — GH₵100 each.
      </p>
      <ShopClient products={products} />
    </div>
  );
}
