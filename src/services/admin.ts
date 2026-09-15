import { OrderStatus, PaymentStatus } from "@/lib/enums";
import { createId, nowIso } from "@/lib/ids";
import { asDate, getSupabaseAdmin } from "@/lib/supabase";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function hoursAgo(n: number) {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

function iso(d: Date) {
  return d.toISOString();
}

export async function getDashboardStats() {
  const sb = getSupabaseAdmin();
  const today = startOfDay();
  const yesterday = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const [
    ordersRes,
    customersRes,
    productsRes,
    itemsRes,
  ] = await Promise.all([
    sb.from("Order").select(
      "id, orderNumber, customerName, totalGhs, orderStatus, paymentStatus, deliveryType, createdAt",
    ),
    sb.from("Customer").select("id, createdAt"),
    sb.from("Product").select("id", { count: "exact", head: true }).eq("active", true),
    sb.from("OrderItem").select("productNameSnapshot, quantity, subtotalGhs"),
  ]);

  if (ordersRes.error) throw new Error(ordersRes.error.message);
  if (customersRes.error) throw new Error(customersRes.error.message);
  if (productsRes.error) throw new Error(productsRes.error.message);
  if (itemsRes.error) throw new Error(itemsRes.error.message);

  const orders = ordersRes.data || [];
  const customers = customersRes.data || [];
  const items = itemsRes.data || [];

  const todayOrders = orders.filter((o) => asDate(o.createdAt) >= today).length;
  const yesterdayOrders = orders.filter((o) => {
    const d = asDate(o.createdAt);
    return d >= yesterday && d < today;
  }).length;

  const todaySales = orders
    .filter((o) => asDate(o.createdAt) >= today && o.paymentStatus === PaymentStatus.SUCCESS)
    .reduce((s, o) => s + (o.totalGhs || 0), 0);
  const yesterdaySales = orders
    .filter((o) => {
      const d = asDate(o.createdAt);
      return d >= yesterday && d < today && o.paymentStatus === PaymentStatus.SUCCESS;
    })
    .reduce((s, o) => s + (o.totalGhs || 0), 0);

  const pendingStatuses = new Set([
    "NEW",
    "PAYMENT_CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
  ]);
  const pendingOrders = orders.filter((o) => pendingStatuses.has(o.orderStatus)).length;
  const completedOrders = orders.filter((o) => o.orderStatus === "COMPLETED").length;
  const totalCustomers = customers.length;
  const totalProducts = productsRes.count || 0;
  const newCustomersToday = customers.filter((c) => asDate(c.createdAt) >= today).length;
  const newCustomersYesterday = customers.filter((c) => {
    const d = asDate(c.createdAt);
    return d >= yesterday && d < today;
  }).length;

  const itemAgg = new Map<string, { quantity: number; revenue: number }>();
  for (const item of items) {
    const key = item.productNameSnapshot || "—";
    const row = itemAgg.get(key) || { quantity: 0, revenue: 0 };
    row.quantity += item.quantity || 0;
    row.revenue += item.subtotalGhs || 0;
    itemAgg.set(key, row);
  }
  const topSelling = [...itemAgg.entries()]
    .map(([name, v]) => ({ name, quantity: v.quantity, revenue: v.revenue }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  const bestSeller = topSelling[0];

  const weekOrders = orders.filter((o) => asDate(o.createdAt) >= weekStart);
  const weeklyOrderCount = weekOrders.length;
  const weeklyRevenue = weekOrders
    .filter((o) => o.paymentStatus === PaymentStatus.SUCCESS)
    .reduce((s, o) => s + (o.totalGhs || 0), 0);

  const statusCount = new Map<string, number>();
  for (const o of weekOrders) {
    statusCount.set(o.orderStatus, (statusCount.get(o.orderStatus) || 0) + 1);
  }
  const statusBreakdown = [...statusCount.entries()].map(([status, count]) => ({
    status,
    count,
  }));

  const recentOrders = [...orders]
    .sort((a, b) => asDate(b.createdAt).getTime() - asDate(a.createdAt).getTime())
    .slice(0, 6);

  const paidWeek = weekOrders.filter((o) => o.paymentStatus === PaymentStatus.SUCCESS);
  const revenueByDayMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    revenueByDayMap.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 });
  }
  for (const o of paidWeek) {
    const key = asDate(o.createdAt).toISOString().slice(0, 10);
    const row = revenueByDayMap.get(key);
    if (!row) continue;
    row.revenue += o.totalGhs || 0;
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

  const peakHourBuckets = new Array(24).fill(0);
  for (const o of paidWeek) {
    peakHourBuckets[asDate(o.createdAt).getHours()] += 1;
  }
  let peakHour = 12;
  let peakCount = 0;
  peakHourBuckets.forEach((c, h) => {
    if (c > peakCount) {
      peakCount = c;
      peakHour = h;
    }
  });

  const aov = todayOrders > 0 ? todaySales / todayOrders : 0;
  const yesterdayAov = yesterdayOrders > 0 ? yesterdaySales / yesterdayOrders : 0;
  const pct = (now: number, prev: number) => {
    if (prev === 0) return now === 0 ? 0 : 100;
    return Math.round(((now - prev) / prev) * 1000) / 10;
  };

  return {
    todayOrders,
    todaySales,
    pendingOrders,
    completedOrders,
    totalCustomers,
    totalProducts,
    weeklyOrderCount,
    bestSellingFlavour: bestSeller?.name || "—",
    weeklyRevenue,
    averageOrderValue: Math.round(aov * 100) / 100,
    trends: {
      orders: pct(todayOrders, yesterdayOrders),
      sales: pct(todaySales, yesterdaySales),
      customers: pct(newCustomersToday, newCustomersYesterday),
      aov: pct(aov, yesterdayAov),
    },
    revenueTrend,
    statusBreakdown,
    topSelling,
    recentOrders,
    insights: {
      bestSeller: bestSeller?.name || "—",
      peakHour: `${String(peakHour).padStart(2, "0")}:00 – ${String((peakHour + 1) % 24).padStart(2, "0")}:00`,
      newCustomersToday,
    },
  };
}

export async function getOrdersByStatus() {
  const sb = getSupabaseAdmin();
  const since = iso(hoursAgo(72));
  const { data, error } = await sb
    .from("Order")
    .select("*, items:OrderItem(*)")
    .gte("createdAt", since)
    .in("orderStatus", [
      OrderStatus.NEW,
      OrderStatus.PAYMENT_CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.COMPLETED,
    ])
    .order("createdAt", { ascending: false })
    .limit(120);
  if (error) throw new Error(error.message);
  const orders = data || [];

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
  const sb = getSupabaseAdmin();
  const ts = nowIso();

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
    const { data: size, error } = await sb
      .from("ProductSize")
      .select("*, product:Product(*)")
      .eq("id", item.sizeId)
      .maybeSingle();
    if (error) throw new Error(error.message);
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

  let { data: customer } = await sb
    .from("Customer")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();
  if (!customer) {
    const { data: created, error } = await sb
      .from("Customer")
      .insert({ id: createId(), phone, fullName: name, updatedAt: ts })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    customer = created;
  }

  const { getNextOrderNumber } = await import("@/services/products");
  const { randomBytes } = await import("crypto");
  const orderNum = await getNextOrderNumber();
  const publicToken = randomBytes(16).toString("hex");
  const orderId = createId();

  const { data: created, error: orderError } = await sb
    .from("Order")
    .insert({
      id: orderId,
      orderNumber: orderNum,
      publicToken,
      customerId: customer.id,
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
      deliveryInstructions: input.note ?? null,
      updatedAt: ts,
    })
    .select("*")
    .single();
  if (orderError) throw new Error(orderError.message);

  const orderItems = lines.map((l) => ({
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

  await sb.from("OrderStatusHistory").insert([
    { id: createId(), orderId, toStatus: OrderStatus.NEW, note: "POS sale started" },
    {
      id: createId(),
      orderId,
      fromStatus: OrderStatus.NEW,
      toStatus: OrderStatus.PAYMENT_CONFIRMED,
      note: `Paid via ${input.paymentMethod}`,
    },
    {
      id: createId(),
      orderId,
      fromStatus: OrderStatus.PAYMENT_CONFIRMED,
      toStatus: OrderStatus.PREPARING,
      note: "Sent to kitchen",
    },
  ]);

  await sb.from("Payment").insert({
    id: createId(),
    orderId,
    reference: `POS-${orderNum}`,
    amountGhs: subtotalGhs,
    provider: "pos",
    status: PaymentStatus.SUCCESS,
    rawPayload: JSON.stringify({ method: input.paymentMethod }),
    updatedAt: ts,
  });

  await sb
    .from("Customer")
    .update({
      totalSpentGhs: (customer.totalSpentGhs || 0) + subtotalGhs,
      orderCount: (customer.orderCount || 0) + 1,
      fullName: name,
      updatedAt: ts,
    })
    .eq("id", customer.id);

  return { ...created, items: orderItems };
}
