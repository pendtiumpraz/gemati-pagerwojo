import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { getDashboardStats } from "@/modules/dashboard/service";

export async function GET(_req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth();
    const stats = await getDashboardStats(session);
    return ok(stats);
  });
}
