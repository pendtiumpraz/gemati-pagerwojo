import { NextRequest } from "next/server";
import { requireAuth, ok, bad, handle } from "@/lib/api";
import { importDesa } from "@/modules/desa/service";
import { logAudit } from "@/modules/auth/service";

// POST /api/desa/import — import massal dari Excel/CSV (body: { rows: [...] })
export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.rows)) return bad("Format tidak valid");
    const result = await importDesa(body.rows);
    await logAudit({
      user: session,
      aksi: "Import Data",
      modul: "Desa",
      detail: `Import ${result.inserted} desa (${result.failed} gagal)`,
    });
    return ok(result, `${result.inserted} baris diimport, ${result.failed} gagal`);
  });
}
