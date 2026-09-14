import { redirect } from "next/navigation";
import { getAdminSession } from "@/services/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return <AdminShell userName={session.fullName}>{children}</AdminShell>;
}
