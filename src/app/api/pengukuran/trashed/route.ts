import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { parseListParams } from "@/lib/query";
import { listPengukuran } from "@/modules/pengukuran/service";

// GET /api/pengukuran/trashed — pengukuran terhapus, scoped per role
export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth();
    const p = parseListParams(new URL(req.url));
    const res = await listPengukuran({
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
