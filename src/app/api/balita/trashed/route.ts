import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { parseListParams } from "@/lib/query";
import { listBalita } from "@/modules/balita/service";

// GET /api/balita/trashed — balita terhapus, scoped per role
export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth();
    const p = parseListParams(new URL(req.url));
    const res = await listBalita({
      role: session.role,
      desa_id: session.desa_id,
      kader_id: session.role === "kader" ? session.id : undefined,
      trashed: true,
      search: p.search,
      page: p.page!,
      pageSize: p.pageSize!,
    });
    return ok(res);
  });
}
