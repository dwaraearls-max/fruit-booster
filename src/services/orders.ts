import { randomBytes } from "crypto";
import {
  DeliveryType,
  OrderStatus,
  PaymentStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { canTransition } from "@/lib/order-status";
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
  const cart = await prisma.cart.findUnique({
    where: { id: input.cartId },
    include: {
      items: {
        include: { product: true, size: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
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
    const zone = await prisma.deliveryZone.findFirst({
      where: {
        active: true,
        OR: [{ name: input.area }, { id: input.deliveryZoneId || "" }],
      },
    });
    if (!zone) throw new Error("Delivery is not available to this area.");
    deliveryFeeGhs = zone.deliveryFeeGhs;
  }

  let discountGhs = 0;
  if (input.promoCode) {
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: input.promoCode.toUpperCase(),
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (!promo) throw new Error("Invalid promo code.");
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
  const totals = await calculateCheckoutTotals(input);
  const publicToken = randomBytes(16).toString("hex");
  const orderNum = await getNextOrderNumber();

  let customer = await prisma.customer.findUnique({ where: { phone: input.phone } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        phone: input.phone,
        fullName: input.customerName,
        whatsappNumber: input.whatsappNumber,
        email: input.email,
      },
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        fullName: input.customerName,
        whatsappNumber: input.whatsappNumber || customer.whatsappNumber,
        email: input.email || customer.email,
      },
    });
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: orderNum,
        publicToken,
        customerId: customer!.id,
        customerName: input.customerName,
        phone: input.phone,
        whatsappNumber: input.whatsappNumber,
        email: input.email,
        deliveryType: input.deliveryType,
        area: input.area,
        deliveryAddress: input.deliveryAddress,
        landmark: input.landmark,
        deliveryInstructions: input.deliveryInstructions,
        pickupLocationId: input.pickupLocationId,
        subtotalGhs: totals.subtotalGhs,
        deliveryFeeGhs: totals.deliveryFeeGhs,
        discountGhs: totals.discountGhs,
        totalGhs: totals.totalGhs,
        promoCode: input.promoCode?.toUpperCase(),
        paymentMethod: input.paymentMethod,
        momoNetwork: input.momoNetwork,
        paymentStatus: PaymentStatus.AWAITING_PAYMENT,
        orderStatus: OrderStatus.NEW,
        items: {
          create: totals.lines.map((l) => ({
            productId: l.productId,
            sizeId: l.sizeId,
            productNameSnapshot: l.productName,
            sizeLabelSnapshot: l.sizeLabel,
            quantity: l.quantity,
            unitPriceSnapshot: l.unitPriceGhs,
            subtotalGhs: l.subtotalGhs,
          })),
        },
        statusHistory: {
          create: { toStatus: OrderStatus.NEW, note: "Order placed" },
        },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: input.cartId } });

    if (input.promoCode) {
      await tx.promoCode.updateMany({
        where: { code: input.promoCode.toUpperCase() },
        data: { usedCount: { increment: 1 } },
      });
    }

    return created;
  });

  return order;
}

export async function getOrderByToken(token: string) {
  return prisma.order.findUnique({
    where: { publicToken: token },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      pickupLocation: true,
    },
  });
}

export async function markOrderPaid(reference: string, rawPayload?: unknown) {
  const order = await prisma.order.findFirst({
    where: { OR: [{ paystackRef: reference }, { publicToken: reference }] },
  });
  if (!order) return null;
  if (order.paymentStatus === PaymentStatus.SUCCESS) return order;

  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.SUCCESS,
        orderStatus:
          order.orderStatus === OrderStatus.NEW ? OrderStatus.PAYMENT_CONFIRMED : order.orderStatus,
        paystackRef: reference,
      },
    });

    await tx.payment.upsert({
      where: { reference },
      create: {
        orderId: order.id,
        reference,
        amountGhs: order.totalGhs,
        provider: order.paymentProvider || "paystack",
        status: PaymentStatus.SUCCESS,
        rawPayload: rawPayload ? JSON.stringify(rawPayload) : undefined,
      },
      update: { status: PaymentStatus.SUCCESS, rawPayload: rawPayload ? JSON.stringify(rawPayload) : undefined },
    });

    if (order.orderStatus === OrderStatus.NEW) {
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: OrderStatus.NEW,
          toStatus: OrderStatus.PAYMENT_CONFIRMED,
          note: "Payment verified",
        },
      });
    }

    if (order.customerId) {
      await tx.customer.update({
        where: { id: order.customerId },
        data: {
          totalSpentGhs: { increment: order.totalGhs },
          orderCount: { increment: 1 },
        },
      });
    }

    return o;
  });

  return updated;
}

export async function updateOrderStatus(
  orderId: string,
  toStatus: OrderStatus,
  userId?: string,
  note?: string,
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (!canTransition(order.orderStatus, toStatus)) {
    throw new Error(`Cannot move order from ${order.orderStatus} to ${toStatus}`);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { orderStatus: toStatus },
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.orderStatus,
        toStatus,
        changedById: userId,
        note,
      },
    });
    return updated;
  });
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
    "Hello FruitFusionX 👋",
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
