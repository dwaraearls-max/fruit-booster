import { getDashboardStats } from "@/services/admin";
import { formatGhs } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    ["Today's Orders", stats.todayOrders],
    ["Today's Sales", formatGhs(stats.todaySales)],
    ["Pending Orders", stats.pendingOrders],
    ["Completed Orders", stats.completedOrders],
    ["Total Customers", stats.totalCustomers],
    ["Best-Selling Flavour", stats.bestSellingFlavour],
  ];

  return (
    <div>
      <h1 className="text-3xl font-black text-plum">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-plum/60">{label}</p>
            <p className="mt-2 text-2xl font-black text-plum">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl bg-white p-6 shadow">
        <h2 className="font-bold text-plum">Weekly Revenue</h2>
        <p className="mt-2 text-3xl font-black text-gold">{formatGhs(stats.weeklyRevenue)}</p>
      </div>
    </div>
  );
}
