import { createHmac } from "crypto";
import { ghsToPesewas } from "./utils";

const PAYSTACK_BASE = "https://api.paystack.co";

export function paystackEnabled() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

export async function initializePaystack(opts: {
  email: string;
  amountGhs: number;
  reference: string;
  callbackUrl: string;
  channels: Array<"mobile_money" | "card">;
  metadata: Record<string, unknown>;
}) {
  if (!paystackEnabled()) {
    return {
      demo: true as const,
      authorization_url: opts.callbackUrl.includes("?")
        ? `${opts.callbackUrl}&reference=${opts.reference}&demo=1`
        : `${opts.callbackUrl}?reference=${opts.reference}&demo=1`,
      reference: opts.reference,
    };
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: opts.email,
      amount: ghsToPesewas(opts.amountGhs),
      currency: "GHS",
      reference: opts.reference,
      callback_url: opts.callbackUrl,
      channels: opts.channels,
      metadata: opts.metadata,
    }),
  });

  const json = (await res.json()) as {
    status: boolean;
    message: string;
    data?: { authorization_url: string; reference: string; access_code: string };
  };

  if (!json.status || !json.data) {
    throw new Error(json.message || "Paystack initialize failed");
  }

  return { demo: false as const, ...json.data };
}

export async function verifyPaystack(reference: string) {
  if (!paystackEnabled()) {
    return { demo: true as const, status: "success", reference };
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const json = (await res.json()) as {
    status: boolean;
    data?: { status: string; reference: string; amount: number };
  };
  if (!json.status || !json.data) throw new Error("Paystack verify failed");
  return { demo: false as const, ...json.data };
}

export function verifyPaystackWebhookSignature(body: string, signature: string | null) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const hash = createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}
