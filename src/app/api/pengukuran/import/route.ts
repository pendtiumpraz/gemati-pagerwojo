import { NextRequest } from "next/server";
import { requireAuth, ok, bad, handle } from "@/lib/api";
import { importPengukuran } from "@/modules/pengukuran/service";
import { logAudit } from "@/modules/auth/service";

// POST /api/pengukuran/import — import massal dari Excel/CSV (body: { rows: [...] })
export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth(["admin", "kader"]);
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.rows)) return bad("Format tidak valid");
    const result = await importPengukuran(body.rows, session);
    await logAudit({
      user: session,
      aksi: "Import Data",
      modul: "Pengukuran",
      detail: `Import ${result.inserted} pengukuran (${result.failed} gagal)`,
    });
    return ok(result, `${result.inserted} baris diimport, ${result.failed} gagal`);
  });
}
