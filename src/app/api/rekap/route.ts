import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { getRekap } from "@/modules/rekap/service";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth(["admin", "ppkbd"]);
    const url = new URL(req.url);
    const p = url.searchParams;

    // ppkbd hanya boleh melihat desanya sendiri
    let desa_id = p.get("desa_id") ? Number(p.get("desa_id")) : undefined;
    if (session.role === "ppkbd") desa_id = session.desa_id ?? -1;

    const res = await getRekap({
      desa_id,
      bulan: p.get("bulan") ? Number(p.get("bulan")) : undefined,
      tahun: p.get("tahun") ? Number(p.get("tahun")) : undefined,
      status: p.get("status") || undefined,
    });
    return ok(res);
  });
}
