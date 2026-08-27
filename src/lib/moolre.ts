import { toLocalGhPhone } from "./ghana";

const LIVE_BASE = "https://api.moolre.com";
const SANDBOX_BASE = "https://sandbox.moolre.com";

export function moolreBaseUrl() {
  return process.env.MOOLRE_SANDBOX === "true" ? SANDBOX_BASE : LIVE_BASE;
}

export function moolreEnabled() {
  return Boolean(
    process.env.MOOLRE_API_USER &&
      process.env.MOOLRE_PUBLIC_KEY &&
      process.env.MOOLRE_ACCOUNT_NUMBER,
  );
}

function moolreHeaders() {
  return {
    "Content-Type": "application/json",
    "X-API-USER": process.env.MOOLRE_API_USER || "",
    "X-API-PUBKEY": process.env.MOOLRE_PUBLIC_KEY || "",
  };
}

export const MOOLRE_CHANNELS = {
  mtn: "13",
  telecel: "6",
  airteltigo: "7",
  at: "7",
} as const;

export type MoolreChannel = keyof typeof MOOLRE_CHANNELS;

export function moolreChannel(network?: string) {
  if (!network) return MOOLRE_CHANNELS.mtn;
  const key = network.toLowerCase() as MoolreChannel;
  return MOOLRE_CHANNELS[key] || MOOLRE_CHANNELS.mtn;
}

type MoolreResponse<T = unknown> = {
  status: number | string;
  code: string;
  message: string | null;
  data: T;
  go?: unknown;
};

/** Direct Mobile Money USSD prompt to customer's phone */
export async function initiateMoolreMoMo(opts: {
  phone: string;
  amountGhs: number;
  externalref: string;
  channel: string;
  otpcode?: string;
  sessionid?: string;
}) {
  if (!moolreEnabled()) {
    return {
      demo: true as const,
      code: "TR099",
      message: null,
      sessionId: null,
      requiresOtp: false,
    };
  }

  const body: Record<string, unknown> = {
    type: 1,
    channel: opts.channel,
    currency: "GHS",
    payer: toLocalGhPhone(opts.phone),
    amount: opts.amountGhs.toFixed(2),
    externalref: opts.externalref,
    accountnumber: process.env.MOOLRE_ACCOUNT_NUMBER,
  };

  if (opts.otpcode) body.otpcode = opts.otpcode;
  if (opts.sessionid) body.sessionid = opts.sessionid;
  if (process.env.MOOLRE_SANDBOX === "true") body.skipotp = true;

  const res = await fetch(`${moolreBaseUrl()}/open/transact/payment`, {
    method: "POST",
    headers: moolreHeaders(),
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as MoolreResponse<string>;

  if (json.code === "TP14") {
    return {
      demo: false as const,
      code: json.code,
      message: json.message,
      requiresOtp: true,
      sessionId: typeof json.data === "string" ? json.data : null,
    };
  }

  if (Number(json.status) !== 1 || json.code !== "TR099") {
    throw new Error(json.message || "Moolre mobile money payment failed.");
  }

  return {
    demo: false as const,
    code: json.code,
    message: json.message,
    requiresOtp: false,
    sessionId: typeof json.data === "string" ? json.data : null,
  };
}

/** Hosted payment page (MoMo + card) */
export async function initiateMoolrePaymentLink(opts: {
  amountGhs: number;
  email: string;
  externalref: string;
  callbackUrl: string;
  redirectUrl: string;
}) {
  if (!moolreEnabled()) {
    return {
      demo: true as const,
      authorization_url: opts.redirectUrl.includes("?")
        ? `${opts.redirectUrl}&reference=${opts.externalref}&demo=1`
        : `${opts.redirectUrl}?reference=${opts.externalref}&demo=1`,
      reference: opts.externalref,
    };
  }

  const res = await fetch(`${moolreBaseUrl()}/embed/link`, {
    method: "POST",
    headers: moolreHeaders(),
    body: JSON.stringify({
      type: 1,
      amount: opts.amountGhs.toFixed(2),
      email: opts.email,
      externalref: opts.externalref,
      callback: opts.callbackUrl,
      redirect: opts.redirectUrl,
      reusable: "0",
      expiration_time: 30,
      currency: "GHS",
      accountnumber: process.env.MOOLRE_ACCOUNT_NUMBER,
      metadata: { externalref: opts.externalref },
    }),
  });

  const json = (await res.json()) as MoolreResponse<{
    authorization_url: string;
    reference: string;
  }>;

  if (Number(json.status) !== 1 || !json.data?.authorization_url) {
    throw new Error(json.message || "Moolre payment link generation failed.");
  }

  return {
    demo: false as const,
    authorization_url: json.data.authorization_url,
    reference: json.data.reference || opts.externalref,
  };
}

export async function verifyMoolrePayment(externalref: string) {
  if (!moolreEnabled()) {
    return { demo: true as const, status: "success" as const, externalref };
  }

  const res = await fetch(`${moolreBaseUrl()}/open/transact/status`, {
    method: "POST",
    headers: moolreHeaders(),
    body: JSON.stringify({
      type: 1,
      idtype: 1,
      id: externalref,
      accountnumber: process.env.MOOLRE_ACCOUNT_NUMBER,
    }),
  });

  const json = (await res.json()) as MoolreResponse<{
    txstatus: number;
    externalref: string;
    amount: string;
    transactionid: string;
  }>;

  const success = Number(json.status) === 1 && json.data?.txstatus === 1;
  return {
    demo: false as const,
    status: success ? ("success" as const) : ("pending" as const),
    externalref,
    data: json.data,
  };
}

export function parseMoolreWebhook(body: {
  status?: number;
  code?: string;
  data?: { externalref?: string; txstatus?: number };
}) {
  const externalref = body.data?.externalref;
  const success =
    Number(body.status) === 1 &&
    (body.code === "P01" || body.data?.txstatus === 1);
  return { success, externalref };
}
