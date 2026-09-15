import { randomBytes } from "crypto";
import type { DeliveryType, OrderStatus } from "@/lib/enums";
import { PaymentStatus } from "@/lib/enums";
import { createId, nowIso } from "@/lib/ids";
import { canTransition } from "@/lib/order-status";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getNextOrderNumber } from "./products";

export type CheckoutInput = {
  customerName: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  deliveryType: DeliveryType;
  area?: string;
  deliveryAddress?: string;
  landmark?: string;
  deliveryInstructions?: string;
  pickupLocationId?: string;
  deliveryZoneId?: string;
  promoCode?: string;
  paymentMethod: "momo" | "card";
  momoNetwork?: string;
  cartId: string;
};

export async function calculateCheckoutTotals(input: CheckoutInput) {
  const sb = getSupabaseAdmin();
  const { data: cart, error } = await sb
    .from("Cart")
    .select(
      `*, items:CartItem(*, product:Product(*), size:ProductSize(*))`,
    )
    .eq("id", input.cartId)
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (!cart || !cart.items?.length) {
    throw new Error("Your cart is empty.");
  }

  const lines = [];
  for (const item of cart.items) {
    if (!item.product.active || !item.product.available || !item.size.available) {
      throw new Error(`${item.product.name} is currently unavailable.`);
    }
    lines.push({
      productId: item.productId,
      sizeId: item.sizeId,
      productName: item.product.name,
      sizeLabel: item.size.label,
      quantity: item.quantity,
      unitPriceGhs: item.size.priceGhs,
      subtotalGhs: item.size.priceGhs * item.quantity,
    });
  }

  const subtotalGhs = lines.reduce((s, l) => s + l.subtotalGhs, 0);
  let deliveryFeeGhs = 0;

  if (input.deliveryType === "DELIVERY") {
    if (!input.area) throw new Error("Please select your delivery area.");
    let zoneQuery = sb.from("DeliveryZone").select("*").eq("active", true);
    const { data: zones, error: zoneError } = await zoneQuery;
    if (zoneError) throw new Error(zoneError.message);
    const zone = (zones || []).find(
      (z) => z.name === input.area || z.id === input.deliveryZoneId,
    );
    if (!zone) throw new Error("Delivery is not available to this area.");
    deliveryFeeGhs = zone.deliveryFeeGhs;
  }

  let discountGhs = 0;
  if (input.promoCode) {
    const code = input.promoCode.toUpperCase();
    const { data: promo, error: promoError } = await sb
      .from("PromoCode")
      .select("*")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();
    if (promoError) throw new Error(promoError.message);
    if (!promo) throw new Error("Invalid promo code.");
    if (promo.expiresAt && new Date(promo.expiresAt) <= new Date()) {
      throw new Error("Invalid promo code.");
    }
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      throw new Error("This promo code has expired.");
    }
    if (subtotalGhs < promo.minOrderGhs) {
      throw new Error(`Minimum order of GH₵${promo.minOrderGhs} required for this promo.`);
    }
    discountGhs =
      promo.type === "PERCENT"
        ? (subtotalGhs * promo.value) / 100
        : Math.min(promo.value, subtotalGhs);
  }

  const totalGhs = Math.max(0, subtotalGhs + deliveryFeeGhs - discountGhs);

  return { lines, subtotalGhs, deliveryFeeGhs, discountGhs, totalGhs };
}

export async function createOrderFromCart(input: CheckoutInput) {
  const sb = getSupabaseAdmin();
  const totals = await calculateCheckoutTotals(input);
  const publicToken = randomBytes(16).toString("hex");
  const orderNum = await getNextOrderNumber();
  const ts = nowIso();

  const { data: existingCustomer, error: findErr } = await sb
    .from("Customer")
    .select("*")
    .eq("phone", input.phone)
    .maybeSingle();
  if (findErr) throw new Error(findErr.message);

  let customer = existingCustomer;
  if (!customer) {
    const { data: created, error } = await sb
      .from("Customer")
      .insert({
        id: createId(),
        phone: input.phone,
        fullName: input.customerName,
        whatsappNumber: input.whatsappNumber ?? null,
        email: input.email ?? null,
        updatedAt: ts,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    customer = created;
  } else {
    const { data: updated, error } = await sb
      .from("Customer")
      .update({
        fullName: input.customerName,
        whatsappNumber: input.whatsappNumber || customer.whatsappNumber,
        email: input.email || customer.email,
        updatedAt: ts,
      })
      .eq("id", customer.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    customer = updated;
  }

  const orderId = createId();
  const { data: createdOrder, error: orderError } = await sb
    .from("Order")
    .insert({
      id: orderId,
      orderNumber: orderNum,
      publicToken,
      customerId: customer.id,
      customerName: input.customerName,
      phone: input.phone,
      whatsappNumber: input.whatsappNumber ?? null,
      email: input.email ?? null,
      deliveryType: input.deliveryType,
      area: input.area ?? null,
      deliveryAddress: input.deliveryAddress ?? null,
      landmark: input.landmark ?? null,
      deliveryInstructions: input.deliveryInstructions ?? null,
      pickupLocationId: input.pickupLocationId ?? null,
      subtotalGhs: totals.subtotalGhs,
      deliveryFeeGhs: totals.deliveryFeeGhs,
      discountGhs: totals.discountGhs,
      totalGhs: totals.totalGhs,
      promoCode: input.promoCode?.toUpperCase() ?? null,
      paymentMethod: input.paymentMethod,
      momoNetwork: input.momoNetwork ?? null,
      paymentStatus: PaymentStatus.AWAITING_PAYMENT,
      orderStatus: "NEW",
      updatedAt: ts,
    })
    .select("*")
    .single();
  if (orderError) throw new Error(orderError.message);

  const orderItems = totals.lines.map((l) => ({
    id: createId(),
    orderId,
    productId: l.productId,
    sizeId: l.sizeId,
    productNameSnapshot: l.productName,
    sizeLabelSnapshot: l.sizeLabel,
    quantity: l.quantity,
    unitPriceSnapshot: l.unitPriceGhs,
    subtotalGhs: l.subtotalGhs,
  }));
  const { error: itemsError } = await sb.from("OrderItem").insert(orderItems);
  if (itemsError) throw new Error(itemsError.message);

  const { error: histError } = await sb.from("OrderStatusHistory").insert({
    id: createId(),
    orderId,
    toStatus: "NEW",
    note: "Order placed",
  });
  if (histError) throw new Error(histError.message);

  const { error: clearCartError } = await sb
    .from("CartItem")
    .delete()
    .eq("cartId", input.cartId);
  if (clearCartError) throw new Error(clearCartError.message);

  if (input.promoCode) {
    const code = input.promoCode.toUpperCase();
    const { data: promo } = await sb
      .from("PromoCode")
      .select("id, usedCount")
      .eq("code", code)
      .maybeSingle();
    if (promo) {
      await sb
        .from("PromoCode")
        .update({ usedCount: (promo.usedCount || 0) + 1, updatedAt: nowIso() })
        .eq("id", promo.id);
    }
  }

  return { ...createdOrder, items: orderItems };
}

export async function getOrderByToken(token: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("Order")
    .select(
      `*, items:OrderItem(*), statusHistory:OrderStatusHistory(*), pickupLocation:PickupLocation(*)`,
    )
    .eq("publicToken", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const statusHistory = [...(data.statusHistory || [])].sort((a, b) =>
    String(a.createdAt).localeCompare(String(b.createdAt)),
  );
  return { ...data, statusHistory };
}

export async function markOrderPaid(reference: string, rawPayload?: unknown) {
  const sb = getSupabaseAdmin();
  const { data: byRef } = await sb
    .from("Order")
    .select("*")
    .eq("paystackRef", reference)
    .maybeSingle();
  const { data: byToken } = byRef
    ? { data: null }
    : await sb.from("Order").select("*").eq("publicToken", reference).maybeSingle();
  const order = byRef || byToken;
  if (!order) return null;
  if (order.paymentStatus === PaymentStatus.SUCCESS) return order;

  const ts = nowIso();
  const nextStatus =
    order.orderStatus === "NEW" ? "PAYMENT_CONFIRMED" : order.orderStatus;

  const { data: updated, error } = await sb
    .from("Order")
    .update({
      paymentStatus: PaymentStatus.SUCCESS,
      orderStatus: nextStatus,
      paystackRef: reference,
      updatedAt: ts,
    })
    .eq("id", order.id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  const { data: existingPayment } = await sb
    .from("Payment")
    .select("id")
    .eq("reference", reference)
    .maybeSingle();

  if (existingPayment) {
    await sb
      .from("Payment")
      .update({
        status: PaymentStatus.SUCCESS,
        rawPayload: rawPayload ? JSON.stringify(rawPayload) : null,
        updatedAt: ts,
      })
      .eq("id", existingPayment.id);
  } else {
    await sb.from("Payment").insert({
      id: createId(),
      orderId: order.id,
      reference,
      amountGhs: order.totalGhs,
      provider: order.paymentProvider || "paystack",
      status: PaymentStatus.SUCCESS,
      rawPayload: rawPayload ? JSON.stringify(rawPayload) : null,
      updatedAt: ts,
    });
  }

  if (order.orderStatus === "NEW") {
    await sb.from("OrderStatusHistory").insert({
      id: createId(),
      orderId: order.id,
      fromStatus: "NEW",
      toStatus: "PAYMENT_CONFIRMED",
      note: "Payment verified",
    });
  }

  if (order.customerId) {
    const { data: customer } = await sb
      .from("Customer")
      .select("totalSpentGhs, orderCount")
      .eq("id", order.customerId)
      .maybeSingle();
    if (customer) {
      await sb
        .from("Customer")
        .update({
          totalSpentGhs: (customer.totalSpentGhs || 0) + order.totalGhs,
          orderCount: (customer.orderCount || 0) + 1,
          updatedAt: ts,
        })
        .eq("id", order.customerId);
    }
  }

  return updated;
}

export async function updateOrderStatus(
  orderId: string,
  toStatus: OrderStatus,
  userId?: string,
  note?: string,
) {
  const sb = getSupabaseAdmin();
  const { data: order, error } = await sb
    .from("Order")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) throw new Error("Order not found");
  if (!canTransition(order.orderStatus as OrderStatus, toStatus)) {
    throw new Error(`Cannot move order from ${order.orderStatus} to ${toStatus}`);
  }

  const { data: updated, error: updateError } = await sb
    .from("Order")
    .update({ orderStatus: toStatus, updatedAt: nowIso() })
    .eq("id", orderId)
    .select("*")
    .single();
  if (updateError) throw new Error(updateError.message);

  await sb.from("OrderStatusHistory").insert({
    id: createId(),
    orderId,
    fromStatus: order.orderStatus,
    toStatus,
    changedById: userId ?? null,
    note: note ?? null,
  });

  return updated;
}

export function buildWhatsAppOrderMessage(order: {
  orderNumber: string;
  customerName: string;
  deliveryType: DeliveryType;
  area?: string | null;
  totalGhs: number;
  items: Array<{
    productNameSnapshot: string;
    sizeLabelSnapshot: string;
    quantity: number;
  }>;
}) {
  const lines = order.items.map(
    (i) => `🍹 ${i.productNameSnapshot} × ${i.quantity}`,
  );
  return [
    "Hello Fruit Booster 👋",
    "",
    "I'd like to order:",
    "",
    ...lines,
    "",
    `${order.deliveryType === "DELIVERY" ? "Delivery" : "Pickup"}${order.area ? `: ${order.area}` : ""}`,
    "",
    `Total: GH₵${order.totalGhs.toFixed(2)}`,
    "",
    `Order reference: ${order.orderNumber}`,
  ].join("\n");
}
