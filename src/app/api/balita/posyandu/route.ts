import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { listPosyanduOpsi } from "@/modules/balita/service";

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAuth();
    const url = new URL(req.url);
    const desaId = url.searchParams.get("desa_id");
    const res = await listPosyanduOpsi(desaId ? Number(desaId) : undefined);
    return ok(res);
  });
}
