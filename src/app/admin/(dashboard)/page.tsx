import { getDashboardStats } from "@/services/admin";
import { getAdminSession } from "@/services/auth";
import { DashboardClient } from "@/components/admin/DashboardClient";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  let stats = null;
  try {
    stats = await getDashboardStats();
  } catch (error) {
    console.error("Admin dashboard stats failed:", error);
  }

  if (!stats) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Could not load stats right now. Check the database connection.
        </p>
      </div>
    );
  }

  return <DashboardClient stats={stats} userName={session?.fullName} />;
}
