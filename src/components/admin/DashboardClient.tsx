"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  PackagePlus,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { formatGhs } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";
import Link from "next/link";

type TrendPoint = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};

type TopItem = { name: string; quantity: number; revenue: number };

type RecentOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  totalGhs: number;
  orderStatus: string;
  paymentStatus: string;
  deliveryType: string;
  createdAt: string | Date;
};

type DashboardClientProps = {
  stats: {
    todayOrders: number;
    todaySales: number;
    pendingOrders: number;
    completedOrders: number;
    totalCustomers: number;
    totalProducts: number;
    weeklyOrderCount: number;
    bestSellingFlavour: string;
    weeklyRevenue: number;
    averageOrderValue: number;
    trends: { orders: number; sales: number; customers: number; aov: number };
    revenueTrend: TrendPoint[];
    statusBreakdown: Array<{ status: string; count: number }>;
    topSelling: TopItem[];
    recentOrders: RecentOrder[];
    insights: { bestSeller: string; peakHour: string; newCustomersToday: number };
  };
  userName?: string;
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#22C55E",
  PREPARING: "#3B82F6",
  PAYMENT_CONFIRMED: "#6366F1",
  READY: "#A855F7",
  OUT_FOR_DELIVERY: "#8B5CF6",
  NEW: "#F59E0B",
  CANCELLED: "#EF4444",
};

const PIE_FALLBACK = ["#22C55E", "#3B82F6", "#8B5CF6", "#EF4444", "#F59E0B", "#6A1B9A"];

function statusBadge(status: string) {
  const label = ORDER_STATUS_LABELS[status as OrderStatus] || status;
  const color = STATUS_COLORS[status] || "#6A1B9A";
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {label}
    </span>
  );
}

function Trend({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={`text-xs font-semibold ${up ? "text-emerald-600" : "text-rose-600"}`}>
      {up ? "↑" : "↓"} {Math.abs(value)}% vs yesterday
    </span>
  );
}

function formatWhen(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardClient({ stats, userName }: DashboardClientProps) {
  const firstName = (userName || "there").trim().split(/\s+/)[0];
  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const kpis = [
    {
      label: "Total Sales",
      value: formatGhs(stats.weeklyRevenue),
      trend: stats.trends.sales,
      icon: Wallet,
      tone: "bg-violet-50 text-plum",
    },
    {
      label: "Total Orders",
      value: String(stats.weeklyOrderCount),
      trend: stats.trends.orders,
      icon: ShoppingBag,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "Total Customers",
      value: String(stats.totalCustomers),
      trend: stats.trends.customers,
      icon: Users,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Total Products",
      value: String(stats.totalProducts),
      trend: 0,
      icon: TrendingUp,
      tone: "bg-amber-50 text-amber-700",
    },
  ];

  const totalStatus = stats.statusBreakdown.reduce((n, s) => n + s.count, 0) || 1;
  const pieData = stats.statusBreakdown.map((s) => ({
    name: ORDER_STATUS_LABELS[s.status as OrderStatus] || s.status,
    value: s.count,
    status: s.status,
  }));

  const maxSold = Math.max(...stats.topSelling.map((t) => t.quantity), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
          <CalendarDays className="h-4 w-4 text-plum" />
          {todayLabel}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{k.label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    {k.value}
                  </p>
                </div>
                <span className={`rounded-xl p-2.5 ${k.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3">
                <Trend value={k.trend} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">Sales Overview</h2>
            <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500">
              Last 7 days
            </span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueTrend}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6A1B9A" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#6A1B9A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
                <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue" ? formatGhs(Number(value ?? 0)) : Number(value ?? 0),
                    name === "revenue" ? "Revenue" : "Orders",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6A1B9A"
                  fill="url(#revFill)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-3">
          <h2 className="font-bold text-slate-900">Order Status</h2>
          <p className="mt-1 text-xs text-slate-500">Total Orders {totalStatus}</p>
          <div className="mt-2 h-44">
            {pieData.length === 0 ? (
              <p className="mt-16 text-center text-sm text-slate-400">No orders this week</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72}>
                    {pieData.map((d, i) => (
                      <Cell
                        key={d.name}
                        fill={STATUS_COLORS[d.status] || PIE_FALLBACK[i % PIE_FALLBACK.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <ul className="mt-1 space-y-1.5 text-xs text-slate-600">
            {pieData.map((d, i) => {
              const color = STATUS_COLORS[d.status] || PIE_FALLBACK[i % PIE_FALLBACK.length];
              const pct = Math.round((d.value / totalStatus) * 100);
              return (
                <li key={d.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
                    {d.name}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {d.value} · {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-3">
          <h2 className="font-bold text-slate-900">Quick Actions</h2>
          <div className="mt-4 space-y-2">
            <Link
              href="/admin/products"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-plum px-4 py-3 text-sm font-bold text-gold transition hover:bg-plum-light"
            >
              <PackagePlus className="h-4 w-4" />
              Manage Products
            </Link>
            <Link
              href="/admin/orders"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              View Orders
            </Link>
            <Link
              href="/admin/customers"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              View Customers
            </Link>
            <Link
              href="/admin/delivery"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Delivery Zones
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Pending kitchen: <strong className="text-slate-700">{stats.pendingOrders}</strong>
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-plum hover:underline">
              View All Orders
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order #</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                      No orders yet
                    </td>
                  </tr>
                )}
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-semibold text-slate-800">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-slate-600">{o.customerName}</td>
                    <td className="px-5 py-3 text-slate-500">{formatWhen(o.createdAt)}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {formatGhs(o.totalGhs)}
                    </td>
                    <td className="px-5 py-3">{statusBadge(o.orderStatus)}</td>
                    <td className="px-5 py-3">
                      <Link
                        href="/admin/orders"
                        className="font-semibold text-plum hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-4">
          <h2 className="font-bold text-slate-900">Top Selling Products</h2>
          <ul className="mt-4 space-y-4">
            {stats.topSelling.length === 0 && (
              <li className="text-sm text-slate-400">No sales recorded yet</li>
            )}
            {stats.topSelling.map((item) => (
              <li key={item.name}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.quantity} sold</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-slate-800">
                    {formatGhs(item.revenue)}
                  </p>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-plum"
                    style={{ width: `${Math.max(8, (item.quantity / maxSold) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
