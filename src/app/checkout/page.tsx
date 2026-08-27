"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatGhs } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";

type Zone = { id: string; name: string; deliveryFeeGhs: number };
type Pickup = { id: string; name: string; address: string; instructions?: string | null };

export default function CheckoutPage() {
  const router = useRouter();
  const { subtotalGhs, itemCount, loading } = useCart();
  const [zones, setZones] = useState<Zone[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [area, setArea] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "card">("momo");
  const [momoNetwork, setMomoNetwork] = useState("mtn");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    whatsappNumber: "",
    email: "",
    deliveryAddress: "",
    landmark: "",
    deliveryInstructions: "",
    promoCode: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setZones(j.data.zones);
          setPickups(j.data.pickupLocations);
        }
      });
  }, []);

  const deliveryFee = deliveryType === "DELIVERY" ? zones.find((z) => z.name === area)?.deliveryFeeGhs || 0 : 0;
  const total = subtotalGhs + deliveryFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deliveryType,
          area: deliveryType === "DELIVERY" ? area : undefined,
          pickupLocationId: deliveryType === "PICKUP" ? pickups[0]?.id : undefined,
          paymentMethod,
          momoNetwork: paymentMethod === "momo" ? momoNetwork : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return;
      }
      if (json.data.requiresOtp) {
        const params = new URLSearchParams({ otp: "1" });
        if (json.data.sessionId) params.set("sessionId", json.data.sessionId);
        router.push(`/order/${json.data.token}?${params.toString()}`);
        return;
      }
      if (json.data.authorizationUrl) {
        window.location.href = json.data.authorizationUrl;
        return;
      }
      if (json.data.pendingMoMo) {
        router.push(`/order/${json.data.token}?pending=1`);
        return;
      }
      router.push(`/order/${json.data.token}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="py-20 text-center">Loading...</div>;
  if (itemCount === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <h1 className="text-3xl font-black text-plum">Guest Checkout</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <fieldset className="space-y-4 rounded-2xl bg-white p-6 shadow">
          <legend className="px-2 text-lg font-bold text-plum">Customer Information</legend>
          {[
            ["customerName", "Full Name", "text"],
            ["phone", "Phone Number", "tel"],
            ["whatsappNumber", "WhatsApp Number", "tel"],
            ["email", "Email (optional)", "email"],
            ["deliveryAddress", "Delivery Address", "text"],
            ["landmark", "Landmark", "text"],
            ["deliveryInstructions", "Delivery Instructions", "text"],
          ].map(([key, label, type]) => (
            <div key={key}>
              <label className="text-sm font-semibold text-plum">{label}</label>
              <input
                type={type}
                required={key !== "email" && key !== "deliveryInstructions" && key !== "whatsappNumber"}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1 w-full rounded-xl border border-plum/20 px-4 py-3"
              />
            </div>
          ))}
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl bg-white p-6 shadow">
          <legend className="px-2 text-lg font-bold text-plum">Order Type</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["DELIVERY", "🚚 DELIVERY"],
              ["PICKUP", "🏪 PICKUP"],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setDeliveryType(val as "DELIVERY" | "PICKUP")}
                className={`rounded-2xl border-2 p-4 text-left font-bold transition ${
                  deliveryType === val ? "border-plum bg-plum text-white" : "border-plum/20 text-plum"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {deliveryType === "DELIVERY" && (
            <select
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-xl border border-plum/20 px-4 py-3"
            >
              <option value="">Select area</option>
              {zones.map((z) => (
                <option key={z.id} value={z.name}>
                  {z.name} — {formatGhs(z.deliveryFeeGhs)}
                </option>
              ))}
            </select>
          )}
          {deliveryType === "PICKUP" && pickups[0] && (
            <p className="text-sm text-plum/70">
              Pickup at: {pickups[0].address}. {pickups[0].instructions}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl bg-white p-6 shadow">
          <legend className="px-2 text-lg font-bold text-plum">Payment</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("momo")}
              className={`rounded-2xl border-2 p-4 font-bold ${paymentMethod === "momo" ? "border-plum bg-plum/10" : "border-plum/20"}`}
            >
              MOBILE MONEY
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`rounded-2xl border-2 p-4 font-bold ${paymentMethod === "card" ? "border-plum bg-plum/10" : "border-plum/20"}`}
            >
              CARD PAYMENT
            </button>
          </div>
          {paymentMethod === "momo" && (
            <select
              value={momoNetwork}
              onChange={(e) => setMomoNetwork(e.target.value)}
              className="w-full rounded-xl border border-plum/20 px-4 py-3"
            >
              <option value="mtn">MTN MoMo</option>
              <option value="telecel">Telecel Cash</option>
              <option value="airteltigo">AirtelTigo Money</option>
            </select>
          )}
        </fieldset>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex justify-between"><span>Juice</span><span>{formatGhs(subtotalGhs)}</span></div>
          <div className="mt-2 flex justify-between"><span>Delivery</span><span>{formatGhs(deliveryFee)}</span></div>
          <div className="mt-4 flex justify-between text-xl font-bold"><span>Total</span><span>{formatGhs(total)}</span></div>
        </div>

        {error && <p className="text-center text-strawberry">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-gold py-4 text-lg font-bold text-plum disabled:opacity-50"
        >
          {submitting ? "Processing Payment..." : "PAY & PLACE ORDER"}
        </button>
      </form>
    </div>
  );
}
