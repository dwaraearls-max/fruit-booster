import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function hoursAgo(n: number) {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

export async function getDashboardStats() {
  const today = startOfDay();
  const yesterday = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const [
    todayOrders,
    yesterdayOrders,
    todaySalesAgg,
    yesterdaySalesAgg,
    pendingOrders,
    completedOrders,
    totalCustomers,
    totalProducts,
    newCustomersToday,
    newCustomersYesterday,
    bestSeller,
    weeklyRevenue,
    weeklyOrderCount,
    statusGroups,
    topItems,
    recentOrders,
    weekOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: today }, paymentStatus: PaymentStatus.SUCCESS },
      _sum: { totalGhs: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: yesterday, lt: today },
        paymentStatus: PaymentStatus.SUCCESS,
      },
      _sum: { totalGhs: true },
    }),
    prisma.order.count({
      where: {
        orderStatus: {
          in: ["NEW", "PAYMENT_CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"],
        },
      },
    }),
    prisma.order.count({ where: { orderStatus: "COMPLETED" } }),
    prisma.customer.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.customer.count({ where: { createdAt: { gte: today } } }),
    prisma.customer.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
    prisma.orderItem.groupBy({
      by: ["productNameSnapshot"],
      _sum: { quantity: true, subtotalGhs: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 1,
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: weekStart }, paymentStatus: PaymentStatus.SUCCESS },
      _sum: { totalGhs: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.order.groupBy({
      by: ["orderStatus"],
      _count: { _all: true },
      where: {
        orderStatus: {
          in: [
            OrderStatus.NEW,
            OrderStatus.PAYMENT_CONFIRMED,
            OrderStatus.PREPARING,
            OrderStatus.READY,
            OrderStatus.OUT_FOR_DELIVERY,
            OrderStatus.COMPLETED,
            OrderStatus.CANCELLED,
          ],
        },
        createdAt: { gte: weekStart },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productNameSnapshot"],
      _sum: { quantity: true, subtotalGhs: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalGhs: true,
        orderStatus: true,
        paymentStatus: true,
        deliveryType: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: weekStart },
        paymentStatus: PaymentStatus.SUCCESS,
      },
      select: { createdAt: true, totalGhs: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const todaySales = todaySalesAgg._sum.totalGhs || 0;
  const yesterdaySales = yesterdaySalesAgg._sum.totalGhs || 0;
  const aov = todayOrders > 0 ? todaySales / todayOrders : 0;
  const yesterdayAov =
    yesterdayOrders > 0 ? yesterdaySales / yesterdayOrders : 0;

  const pct = (now: number, prev: number) => {
    if (prev === 0) return now === 0 ? 0 : 100;
    return Math.round(((now - prev) / prev) * 1000) / 10;
  };

  const revenueByDayMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    revenueByDayMap.set(key, { revenue: 0, orders: 0 });
  }
  for (const o of weekOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    const row = revenueByDayMap.get(key);
    if (!row) continue;
    row.revenue += o.totalGhs;
    row.orders += 1;
  }

  const revenueTrend = Array.from(revenueByDayMap.entries()).map(([date, v]) => ({
    date,
    label: new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
      weekday: "short",
    }),
    revenue: Math.round(v.revenue * 100) / 100,
    orders: v.orders,
  }));

  const statusBreakdown = statusGroups.map((g) => ({
    status: g.orderStatus,
    count: g._count._all,
  }));

  const peakHourBuckets = new Array(24).fill(0);
  for (const o of weekOrders) {
    peakHourBuckets[o.createdAt.getHours()] += 1;
  }
  let peakHour = 12;
  let peakCount = 0;
  peakHourBuckets.forEach((c, h) => {
    if (c > peakCount) {
      peakCount = c;
      peakHour = h;
    }
  });

  return {
    todayOrders,
    todaySales,
    pendingOrders,
    completedOrders,
    totalCustomers,
    totalProducts,
    weeklyOrderCount,
    bestSellingFlavour: bestSeller[0]?.productNameSnapshot || "—",
    weeklyRevenue: weeklyRevenue._sum.totalGhs || 0,
    averageOrderValue: Math.round(aov * 100) / 100,
    trends: {
      orders: pct(todayOrders, yesterdayOrders),
      sales: pct(todaySales, yesterdaySales),
      customers: pct(newCustomersToday, newCustomersYesterday),
      aov: pct(aov, yesterdayAov),
    },
    revenueTrend,
    statusBreakdown,
    topSelling: topItems.map((i) => ({
      name: i.productNameSnapshot,
      quantity: i._sum.quantity || 0,
      revenue: i._sum.subtotalGhs || 0,
    })),
    recentOrders,
    insights: {
      bestSeller: bestSeller[0]?.productNameSnapshot || "—",
      peakHour: `${String(peakHour).padStart(2, "0")}:00 – ${String((peakHour + 1) % 24).padStart(2, "0")}:00`,
      newCustomersToday,
    },
  };
}

export async function getOrdersByStatus() {
  const orders = await prisma.order.findMany({
    where: {
      orderStatus: {
        in: [
          OrderStatus.NEW,
          OrderStatus.PAYMENT_CONFIRMED,
          OrderStatus.PREPARING,
          OrderStatus.READY,
          OrderStatus.OUT_FOR_DELIVERY,
          OrderStatus.COMPLETED,
        ],
      },
      createdAt: { gte: hoursAgo(72) },
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 120,
  });

  const board: Record<string, typeof orders> = {
    NEW: [],
    PREPARING: [],
    READY: [],
    OUT_FOR_DELIVERY: [],
    COMPLETED: [],
  };

  for (const order of orders) {
    if (
      order.orderStatus === OrderStatus.PAYMENT_CONFIRMED ||
      order.orderStatus === OrderStatus.NEW
    ) {
      board.NEW.push(order);
    } else if (order.orderStatus in board) {
      board[order.orderStatus].push(order);
    }
  }

  return board;
}

export async function createPosOrder(input: {
  customerName: string;
  phone?: string;
  paymentMethod: "cash" | "momo";
  items: Array<{ productId: string; sizeId: string; quantity: number }>;
  note?: string;
}) {
  if (!input.items.length) throw new Error("Add at least one item.");

  const lines: Array<{
    productId: string;
    sizeId: string;
    productName: string;
    sizeLabel: string;
    quantity: number;
    unitPriceGhs: number;
    subtotalGhs: number;
  }> = [];
  for (const item of input.items) {
    const size = await prisma.productSize.findUnique({
      where: { id: item.sizeId },
      include: { product: true },
    });
    if (!size || size.productId !== item.productId) {
      throw new Error("Invalid product size.");
    }
    if (!size.product.active || !size.product.available || !size.available) {
      throw new Error(`${size.product.name} is unavailable.`);
    }
    const qty = Math.max(1, Math.min(20, item.quantity));
    lines.push({
      productId: size.productId,
      sizeId: size.id,
      productName: size.product.name,
      sizeLabel: size.label,
      quantity: qty,
      unitPriceGhs: size.priceGhs,
      subtotalGhs: size.priceGhs * qty,
    });
  }

  const subtotalGhs = lines.reduce((s, l) => s + l.subtotalGhs, 0);
  const phone = (input.phone || "0000000000").replace(/\s+/g, "");
  const name = input.customerName.trim() || "Walk-in Customer";

  let customer = await prisma.customer.findUnique({ where: { phone } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { phone, fullName: name },
    });
  }

  const { getNextOrderNumber } = await import("@/services/products");
  const { randomBytes } = await import("crypto");
  const orderNum = await getNextOrderNumber();
  const publicToken = randomBytes(16).toString("hex");

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: orderNum,
        publicToken,
        customerId: customer!.id,
        customerName: name,
        phone,
        deliveryType: "PICKUP",
        subtotalGhs,
        deliveryFeeGhs: 0,
        discountGhs: 0,
        totalGhs: subtotalGhs,
        paymentMethod: input.paymentMethod,
        paymentProvider: "pos",
        paymentStatus: PaymentStatus.SUCCESS,
        orderStatus: OrderStatus.PREPARING,
        deliveryInstructions: input.note,
        items: {
          create: lines.map((l) => ({
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
          create: [
            { toStatus: OrderStatus.NEW, note: "POS sale started" },
            {
              fromStatus: OrderStatus.NEW,
              toStatus: OrderStatus.PAYMENT_CONFIRMED,
              note: `Paid via ${input.paymentMethod}`,
            },
            {
              fromStatus: OrderStatus.PAYMENT_CONFIRMED,
              toStatus: OrderStatus.PREPARING,
              note: "Sent to kitchen",
            },
          ],
        },
        payments: {
          create: {
            reference: `POS-${orderNum}`,
            amountGhs: subtotalGhs,
            provider: "pos",
            status: PaymentStatus.SUCCESS,
            rawPayload: JSON.stringify({ method: input.paymentMethod }),
          },
        },
      },
      include: { items: true },
    });

    await tx.customer.update({
      where: { id: customer!.id },
      data: {
        totalSpentGhs: { increment: subtotalGhs },
        orderCount: { increment: 1 },
        fullName: name,
      },
    });

    return created;
  });

  return order;
}
