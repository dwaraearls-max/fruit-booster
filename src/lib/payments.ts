import { moolreEnabled, initiateMoolreMoMo, initiateMoolrePaymentLink, verifyMoolrePayment, moolreChannel } from "./moolre";
import { paystackEnabled, initializePaystack, verifyPaystack } from "./paystack";

export type PaymentProviderName = "moolre" | "paystack" | "demo";

export function getPaymentProvider(): PaymentProviderName {
  const preferred = process.env.PAYMENT_PROVIDER?.toLowerCase();
  if (preferred === "moolre" && moolreEnabled()) return "moolre";
  if (preferred === "paystack" && paystackEnabled()) return "paystack";
  if (moolreEnabled()) return "moolre";
  if (paystackEnabled()) return "paystack";
  return "demo";
}

export type InitializePaymentInput = {
  email: string;
  phone: string;
  amountGhs: number;
  reference: string;
  callbackUrl: string;
  redirectUrl: string;
  paymentMethod: "momo" | "card";
  momoNetwork?: string;
};

export type InitializePaymentResult =
  | {
      provider: PaymentProviderName;
      demo: boolean;
      authorizationUrl?: string;
      pendingMoMo?: boolean;
      requiresOtp?: boolean;
      sessionId?: string | null;
      reference: string;
      message?: string | null;
    }
  | { provider: PaymentProviderName; demo: boolean; authorizationUrl: string; reference: string };

export async function initializePayment(
  input: InitializePaymentInput,
): Promise<InitializePaymentResult> {
  const provider = getPaymentProvider();
  const businessEmail =
    process.env.MOOLRE_BUSINESS_EMAIL || process.env.ADMIN_EMAIL || "hello@fruitfusion.gh";

  if (provider === "moolre") {
    if (input.paymentMethod === "momo") {
      const result = await initiateMoolreMoMo({
        phone: input.phone,
        amountGhs: input.amountGhs,
        externalref: input.reference,
        channel: moolreChannel(input.momoNetwork),
      });
      if ("demo" in result && result.demo) {
        return {
          provider,
          demo: true,
          authorizationUrl: `${input.redirectUrl}?reference=${input.reference}&demo=1`,
          reference: input.reference,
        };
      }
      return {
        provider,
        demo: false,
        pendingMoMo: !result.requiresOtp,
        requiresOtp: result.requiresOtp,
        sessionId: result.sessionId,
        reference: input.reference,
        message: result.message,
      };
    }

    const link = await initiateMoolrePaymentLink({
      amountGhs: input.amountGhs,
      email: businessEmail,
      externalref: input.reference,
      callbackUrl: input.callbackUrl,
      redirectUrl: input.redirectUrl,
    });
    return {
      provider,
      demo: link.demo,
      authorizationUrl: link.authorization_url,
      reference: link.reference,
    };
  }

  if (provider === "paystack") {
    const pay = await initializePaystack({
      email: input.email,
      amountGhs: input.amountGhs,
      reference: input.reference,
      callbackUrl: input.redirectUrl,
      channels: input.paymentMethod === "card" ? ["card"] : ["mobile_money"],
      metadata: { reference: input.reference },
    });
    return {
      provider,
      demo: pay.demo,
      authorizationUrl: pay.authorization_url,
      reference: pay.reference,
    };
  }

  return {
    provider: "demo",
    demo: true,
    authorizationUrl: `${input.redirectUrl}?reference=${input.reference}&demo=1`,
    reference: input.reference,
  };
}

export async function verifyPayment(reference: string, provider?: PaymentProviderName) {
  const active = provider || getPaymentProvider();

  if (active === "moolre") {
    const result = await verifyMoolrePayment(reference);
    return { provider: active, status: result.status, demo: "demo" in result ? result.demo : false };
  }

  if (active === "paystack") {
    const result = await verifyPaystack(reference);
    return {
      provider: active,
      status: result.status === "success" ? ("success" as const) : ("pending" as const),
      demo: "demo" in result ? result.demo : false,
    };
  }

  return { provider: "demo" as const, status: "success" as const, demo: true };
}
