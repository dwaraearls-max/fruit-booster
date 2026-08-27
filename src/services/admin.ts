import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function getDashboardStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todayOrders, todaySales, pendingOrders, completedOrders, totalCustomers, bestSeller] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfDay },
          paymentStatus: "SUCCESS",
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
      prisma.orderItem.groupBy({
        by: ["productNameSnapshot"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 1,
      }),
    ]);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const weeklyRevenue = await prisma.order.aggregate({
    where: { createdAt: { gte: weekStart }, paymentStatus: "SUCCESS" },
    _sum: { totalGhs: true },
  });

  return {
    todayOrders,
    todaySales: todaySales._sum.totalGhs || 0,
    pendingOrders,
    completedOrders,
    totalCustomers,
    bestSellingFlavour: bestSeller[0]?.productNameSnapshot || "—",
    weeklyRevenue: weeklyRevenue._sum.totalGhs || 0,
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
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const board: Record<string, typeof orders> = {
    NEW: [],
    PREPARING: [],
    READY: [],
    OUT_FOR_DELIVERY: [],
    COMPLETED: [],
  };

  for (const order of orders) {
    if (order.orderStatus === OrderStatus.PAYMENT_CONFIRMED) {
      board.NEW.push(order);
    } else if (order.orderStatus in board) {
      board[order.orderStatus].push(order);
    }
  }

  return board;
}
