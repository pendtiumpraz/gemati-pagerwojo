import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { parseListParams } from "@/lib/query";
import { listDesaCrud } from "@/modules/desa/service";

// GET /api/desa/trashed — daftar desa terhapus (soft delete)
export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAuth(["admin"]);
    const url = new URL(req.url);
    const p = parseListParams(url);
    const res = await listDesaCrud({ ...p, trashed: true, page: p.page!, pageSize: p.pageSize! });
    return ok(res);
  });
}
