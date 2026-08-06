import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { parseListParams } from "@/lib/query";
import { listUsers } from "@/modules/users/service";

// GET /api/users/trashed — daftar pengguna terhapus (soft delete)
export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAuth(["admin"]);
    const url = new URL(req.url);
    const p = parseListParams(url);
    const role = url.searchParams.get("role") || undefined;
    const res = await listUsers({ ...p, role, trashed: true, page: p.page!, pageSize: p.pageSize! });
    return ok(res);
  });
}
