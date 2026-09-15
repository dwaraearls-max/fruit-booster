import { Resend } from "resend";
import { BRAND } from "@/lib/site-content";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL ||
    `Fruit Booster <orders@${process.env.RESEND_FROM_DOMAIN || "fruitbooster.gh"}>`
  );
}

function notifyEmail() {
  return process.env.ORDER_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || BRAND.email;
}

export type OrderEmailPayload = {
  orderNumber: string;
  publicToken: string;
  customerName: string;
  phone: string;
  email?: string | null;
  totalGhs: number;
  deliveryType: string;
  area?: string | null;
  items: Array<{ name: string; quantity: number; subtotalGhs: number }>;
};

function orderLinesHtml(order: OrderEmailPayload) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.name} × ${i.quantity}</td><td style="text-align:right">GH₵${i.subtotalGhs.toFixed(2)}</td></tr>`,
    )
    .join("");
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Segoe UI,Arial,sans-serif;color:#4A148C">
      <tr><td colspan="2" style="padding-bottom:12px"><strong style="font-size:18px">Order ${order.orderNumber}</strong></td></tr>
      ${rows}
      <tr><td style="padding-top:12px;border-top:1px solid #eee"><strong>Total</strong></td><td style="padding-top:12px;border-top:1px solid #eee;text-align:right"><strong>GH₵${order.totalGhs.toFixed(2)}</strong></td></tr>
    </table>
  `;
}

/** Fire-and-forget safe send — never throws to callers. */
export async function sendOrderEmails(order: OrderEmailPayload) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping order emails");
    return { skipped: true as const };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const trackUrl = `${site}/order/${order.publicToken}`;
  const html = `
    <div style="background:#FBE351;padding:24px">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:24px">
        <p style="margin:0 0 8px;color:#6A1B9A;font-weight:800;font-size:22px">${BRAND.name}</p>
        <p style="margin:0 0 16px;color:#8E24AA">${BRAND.tagline}</p>
        <p>Hi ${order.customerName},</p>
        <p>Thanks for your order. Track it here:</p>
        <p><a href="${trackUrl}" style="color:#6A1B9A;font-weight:700">${trackUrl}</a></p>
        ${orderLinesHtml(order)}
        <p style="margin-top:20px;font-size:13px;color:#666">Questions? WhatsApp us or reply to this email.</p>
      </div>
    </div>
  `;

  const results: Array<{ to: string; ok: boolean; error?: string }> = [];

  if (order.email) {
    try {
      const { error } = await resend.emails.send({
        from: fromAddress(),
        to: order.email,
        subject: `Order ${order.orderNumber} received — Fruit Booster`,
        html,
      });
      results.push({ to: order.email, ok: !error, error: error?.message });
    } catch (e) {
      results.push({
        to: order.email,
        ok: false,
        error: e instanceof Error ? e.message : "send failed",
      });
    }
  }

  try {
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: notifyEmail(),
      subject: `New order ${order.orderNumber} — ${order.customerName}`,
      html: `
        <p>New Fruit Booster order</p>
        <p>Customer: ${order.customerName} · ${order.phone}</p>
        <p>Type: ${order.deliveryType}${order.area ? ` · ${order.area}` : ""}</p>
        <p><a href="${trackUrl}">${trackUrl}</a></p>
        ${orderLinesHtml(order)}
      `,
    });
    results.push({ to: notifyEmail(), ok: !error, error: error?.message });
  } catch (e) {
    results.push({
      to: notifyEmail(),
      ok: false,
      error: e instanceof Error ? e.message : "send failed",
    });
  }

  return { skipped: false as const, results };
}

export async function sendContactEmail(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping contact email");
    return { skipped: true as const };
  }

  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: notifyEmail(),
    replyTo: input.email,
    subject: `Contact form — ${input.name}`,
    html: `
      <p><strong>${input.name}</strong> (${input.email}${input.phone ? ` · ${input.phone}` : ""})</p>
      <p>${input.message.replace(/\n/g, "<br/>")}</p>
    `,
  });

  if (error) throw new Error(error.message);
  return { skipped: false as const };
}
