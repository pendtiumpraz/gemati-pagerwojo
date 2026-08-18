import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DeploymentSettings } from "@/modules/superadmin/DeploymentSettings";

export default async function DeploymentPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/dashboard");
  return <DeploymentSettings />;
}
