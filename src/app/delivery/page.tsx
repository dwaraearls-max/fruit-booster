import { getSupabaseAdmin } from "@/lib/supabase";
import { formatGhs } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Delivery Information" };

type Zone = {
  id: string;
  name: string;
  deliveryFeeGhs: number;
  estimatedMins: number;
};

export default async function DeliveryPage() {
  let zones: Zone[] = [];
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("DeliveryZone")
      .select("id, name, deliveryFeeGhs, estimatedMins")
      .eq("active", true)
      .order("sortOrder", { ascending: true });
    if (error) throw new Error(error.message);
    zones = data || [];
  } catch (error) {
    console.error("Delivery page data load failed:", error);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="text-4xl font-black text-plum">Delivery Information</h1>
      <p className="mt-4 text-plum/80">
        We deliver across Accra and surrounding areas. Delivery fees are shown clearly before you pay.
      </p>
      <ul className="mt-8 space-y-3">
        {zones.map((z) => (
          <li key={z.id} className="flex justify-between rounded-2xl bg-gold/10 p-4 shadow">
            <span className="font-semibold">{z.name}</span>
            <span>
              {formatGhs(z.deliveryFeeGhs)} · ~{z.estimatedMins} mins
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
