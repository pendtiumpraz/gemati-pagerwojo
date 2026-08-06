import { getSession } from "@/lib/session";
import { AdminDashboard } from "@/modules/dashboard/AdminDashboard";
import { PpkbdDashboard } from "@/modules/dashboard/PpkbdDashboard";
import { KaderDashboard } from "@/modules/dashboard/KaderDashboard";

export default async function DashboardPage() {
  const session = (await getSession())!;

  if (session.role === "admin") return <AdminDashboard />;
  if (session.role === "ppkbd") return <PpkbdDashboard />;
  return <KaderDashboard />;
}
