import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { parseListParams } from "@/lib/query";
import { listAudit } from "@/modules/audit/service";

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAuth(["admin"]);
    const url = new URL(req.url);
    const p = parseListParams(url);
    const res = await listAudit({
      aksi: url.searchParams.get("aksi") || undefined,
      role: url.searchParams.get("role") || undefined,
      search: p.search,
      page: p.page!,
      pageSize: p.pageSize!,
    });
    return ok(res);
  });
}
